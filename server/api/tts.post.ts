// =============================================================
// POST /api/tts —— 文本转语音（代理 MiMo-V2.5-TTS）
// 说明：上游返回 base64 音频，这里解成二进制直接吐给浏览器，
//      避免 base64 再膨胀 33%，前端拿 blob 即可试听 + 下载。
// =============================================================
import type { H3Event } from 'h3'
import {
  DEFAULT_TTS_FORMAT,
  DEFAULT_TTS_STYLE,
  DEFAULT_TTS_VOICE,
  TTS_MAX_STYLE,
  TTS_MAX_TEXT,
  isTtsFormat,
  isTtsVoice,
} from '#shared/tts'

const MIMO_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions'
const MIMO_MODEL = 'mimo-v2.5-tts'
/** 上游合成耗时随文本线性增长（实测 400 字约 35s），留足余量 */
const UPSTREAM_TIMEOUT = 240_000

interface MimoChatResponse {
  choices?: Array<{ message?: { audio?: { data?: string } } }>
  usage?: { total_tokens?: number }
}

interface TtsBody {
  text?: unknown
  style?: unknown
  voice?: unknown
  format?: unknown
}

// ---- 简易限流：防止接口被刷爆（每 IP 每分钟 6 次，够用且不至于误伤）----
const RATE_WINDOW = 60_000
const RATE_LIMIT = 6
const rateHits = new Map<string, number[]>()

function rateLimited(event: H3Event) {
  // 前面挂 Nginx 时取 XFF 的最后一段（由最近的代理追加，客户端无法伪造前面的值）
  const chain = getHeader(event, 'x-forwarded-for')?.split(',').map(s => s.trim()).filter(Boolean)
  const ip = chain?.[chain.length - 1] || getRequestIP(event) || 'unknown'
  const now = Date.now()
  const recent = (rateHits.get(ip) ?? []).filter(ts => now - ts < RATE_WINDOW)
  if (recent.length >= RATE_LIMIT) {
    rateHits.set(ip, recent)
    setResponseHeader(event, 'retry-after', String(Math.ceil((RATE_WINDOW - (now - recent[0]!)) / 1000)))
    return true
  }
  recent.push(now)
  rateHits.set(ip, recent)
  // 顺手清理过期的 IP，避免 Map 无限增长
  if (rateHits.size > 500) {
    for (const [key, list] of rateHits) {
      if (!list.some(ts => now - ts < RATE_WINDOW)) rateHits.delete(key)
    }
  }
  return false
}

function fail(event: H3Event, status: number, message: string) {
  setResponseStatus(event, status)
  return { message }
}

/** 上游错误 → 面向用户的提示 */
function mapUpstreamError(event: H3Event, err: unknown) {
  const e = err as { statusCode?: number; message?: string }
  const status = e?.statusCode ?? 0
  const text = e?.message ?? ''

  if (status === 401 || status === 403) {
    return fail(event, 502, 'MiMo API Key 无效或已过期，请检查 .env 里的 NUXT_MIMO_API_KEY')
  }
  if (status === 429) {
    return fail(event, 429, '上游限流了，请稍等片刻再试')
  }
  if (status === 400) {
    return fail(event, 400, '上游拒绝了本次请求，请检查文本内容或音色')
  }
  if (/timeout|timed out/i.test(text)) {
    return fail(event, 504, '上游合成超时，请缩短文本后重试')
  }
  console.error('[tts] upstream failed:', status, text)
  return fail(event, 502, '语音合成服务暂时不可用，请稍后重试')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiKey = config.mimoApiKey

  if (!apiKey) {
    return fail(event, 500, '服务端未配置 NUXT_MIMO_API_KEY，无法调用语音合成')
  }

  const body = await readBody<TtsBody>(event).catch(() => null)
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  const rawStyle = typeof body?.style === 'string' ? body.style.trim() : ''
  const voice = isTtsVoice(body?.voice) ? body.voice : DEFAULT_TTS_VOICE
  const format = isTtsFormat(body?.format) ? body.format : DEFAULT_TTS_FORMAT

  if (!text) {
    return fail(event, 400, '请先输入要合成的文本')
  }
  if (text.length > TTS_MAX_TEXT) {
    return fail(event, 400, `文本过长，单次最多 ${TTS_MAX_TEXT} 字，请分段合成`)
  }

  // 只对真正会消耗额度的请求计数
  if (rateLimited(event)) {
    return fail(event, 429, '请求太频繁了，请等一分钟再试')
  }

  const style = (rawStyle || DEFAULT_TTS_STYLE).slice(0, TTS_MAX_STYLE)

  let json: MimoChatResponse
  try {
    json = await $fetch<MimoChatResponse>(MIMO_ENDPOINT, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json' },
      body: {
        model: MIMO_MODEL,
        messages: [
          { role: 'user', content: style },
          { role: 'assistant', content: text },
        ],
        audio: { format, voice },
      },
      timeout: UPSTREAM_TIMEOUT,
      retry: 0,
    })
  }
  catch (err) {
    return mapUpstreamError(event, err)
  }

  const base64 = json?.choices?.[0]?.message?.audio?.data
  if (!base64) {
    return fail(event, 502, '上游没有返回音频数据，请稍后重试')
  }

  const audio = Buffer.from(base64, 'base64')
  if (audio.length === 0) {
    return fail(event, 502, '上游返回的音频为空，请稍后重试')
  }

  setResponseHeaders(event, {
    'content-type': format === 'wav' ? 'audio/wav' : 'audio/mpeg',
    'content-length': String(audio.length),
    'cache-control': 'no-store',
    'x-tts-format': format,
    'x-tts-chars': String(text.length),
    'x-tts-tokens': String(json?.usage?.total_tokens ?? 0),
  })

  return audio
})

// =============================================================
// 语音合成（MiMo-V2.5-TTS）共享常量
// app 与 server 共用：页面渲染选项、服务端做白名单校验
// 接口文档：https://mimo.mi.com/docs/zh-CN/api/audio/tts
// =============================================================

/** 预置音色（mimo-v2.5-tts 只支持这 9 个，传入其他值上游会返回 400） */
export const TTS_VOICES = [
  { id: 'mimo_default', label: 'MiMo 默认' },
  { id: '冰糖', label: '冰糖' },
  { id: '茉莉', label: '茉莉' },
  { id: '苏打', label: '苏打' },
  { id: '白桦', label: '白桦' },
  { id: 'Mia', label: 'Mia' },
  { id: 'Chloe', label: 'Chloe' },
  { id: 'Milo', label: 'Milo' },
  { id: 'Dean', label: 'Dean' },
] as const

export type TtsVoice = (typeof TTS_VOICES)[number]['id']

/** 输出格式：mp3 体积小，wav 无损但体积约为 mp3 的 5 倍 */
export const TTS_FORMATS = ['mp3', 'wav'] as const

export type TtsFormat = (typeof TTS_FORMATS)[number]

export const DEFAULT_TTS_VOICE: TtsVoice = 'mimo_default'
export const DEFAULT_TTS_FORMAT: TtsFormat = 'mp3'

/** 语速/情绪等自然语言指令，留空时用它兜底（assistant 之外必须有一条 user 消息体验更稳） */
export const DEFAULT_TTS_STYLE = '自然、清晰的播报语气，语速适中，停顿得当。'

/** 常用风格预设 */
export const TTS_STYLE_PRESETS = [
  { label: '自然播报', value: DEFAULT_TTS_STYLE },
  { label: '温柔', value: '温柔亲切的语气，语速稍慢，声音柔和，句尾自然收住。' },
  { label: '兴奋', value: '兴奋、上扬的语气，语速偏快，情绪饱满，像在分享好消息。' },
  { label: '沉稳', value: '沉稳严肃的语气，语速平稳，适合正式场合播报。' },
  { label: '讲故事', value: '像讲睡前故事一样，语气舒缓，节奏有起伏，有画面感。' },
] as const

/** 文本上限：单次合成耗时随字数线性增长，超过这个量请分段合成 */
export const TTS_MAX_TEXT = 500

/** 风格指令上限 */
export const TTS_MAX_STYLE = 300

export const TTS_SAMPLE_TEXT = '欢迎使用 XiaoHome 语音合成模块。输入一段文字，选择音色与输出格式，即可在线试听并下载音频文件。'

export function isTtsVoice(value: unknown): value is TtsVoice {
  return typeof value === 'string' && TTS_VOICES.some(v => v.id === value)
}

export function isTtsFormat(value: unknown): value is TtsFormat {
  return typeof value === 'string' && (TTS_FORMATS as readonly string[]).includes(value)
}

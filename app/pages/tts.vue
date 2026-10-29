<template>
  <div class="page-wrap tts">
    <PageHeader
      index="03"
      kicker="MODULES / SPEECH"
      title="语音合成"
      desc="输入文本，由 MiMo-V2.5-TTS 合成语音，可在线试听并下载 mp3 / wav 文件。"
    >
      <template #actions>
        <span class="stat">
          <span class="tech-label">ENGINE</span>
          <strong class="stat__val">mimo-v2.5-tts</strong>
        </span>
        <span class="stat">
          <span class="tech-label">VOICES</span>
          <strong class="stat__val">{{ TTS_VOICES.length }}</strong>
        </span>
      </template>
    </PageHeader>

    <div class="tts__grid">
      <!-- ---------------- 左：输入 ---------------- -->
      <section class="panel tech-panel tech-corners" aria-labelledby="tts-input-title">
        <header class="panel__bar">
          <h2 id="tts-input-title" class="panel__title">
            <span class="panel__dot" aria-hidden="true" />
            INPUT
          </h2>
          <span class="panel__hint">Ctrl / ⌘ + Enter 快速合成</span>
        </header>

        <div class="panel__body">
          <div class="field">
            <div class="field__head">
              <span class="field__label"><span class="field__no">01</span>文本内容</span>
              <span class="field__count" :class="{ 'is-near': text.length > TTS_MAX_TEXT * 0.9 }">
                {{ text.length }} / {{ TTS_MAX_TEXT }}
              </span>
            </div>
            <el-input
              v-model="text"
              type="textarea"
              :rows="8"
              resize="vertical"
              :maxlength="TTS_MAX_TEXT"
              aria-label="要合成的文本"
              placeholder="在这里输入要合成的文本，最多 500 字……"
              @keydown.ctrl.enter.prevent="generate"
              @keydown.meta.enter.prevent="generate"
            />
            <div class="field__foot">
              <button type="button" class="linkbtn" @click="text = TTS_SAMPLE_TEXT">插入示例文本</button>
              <button type="button" class="linkbtn" :disabled="!text" @click="text = ''">清空</button>
            </div>
          </div>

          <div class="field">
            <div class="field__head">
              <span class="field__label"><span class="field__no">02</span>语气 / 风格指令</span>
              <span class="field__opt">可选</span>
            </div>
            <el-input
              v-model="style"
              type="textarea"
              :rows="3"
              resize="vertical"
              :maxlength="TTS_MAX_STYLE"
              aria-label="语气与风格指令"
              placeholder="例如：Bright, bouncy tone, fast pace, rising pitch at the end."
            />
            <div class="chips">
              <button
                v-for="preset in TTS_STYLE_PRESETS"
                :key="preset.label"
                type="button"
                class="chip"
                :class="{ 'is-on': style === preset.value }"
                @click="style = style === preset.value ? '' : preset.value"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <div class="field__head">
                <span class="field__label"><span class="field__no">03</span>音色</span>
              </div>
              <el-select v-model="voice" aria-label="选择音色" class="w-full">
                <el-option
                  v-for="item in TTS_VOICES"
                  :key="item.id"
                  :label="item.label"
                  :value="item.id"
                >
                  <span class="opt">
                    <span class="opt__label">{{ item.label }}</span>
                    <span class="opt__id">{{ item.id }}</span>
                  </span>
                </el-option>
              </el-select>
            </div>

            <div class="field">
              <div class="field__head">
                <span class="field__label"><span class="field__no">04</span>输出格式</span>
              </div>
              <div class="segs" role="group" aria-label="输出格式">
                <button
                  v-for="item in TTS_FORMATS"
                  :key="item"
                  type="button"
                  class="seg"
                  :class="{ 'is-on': format === item }"
                  @click="format = item"
                >
                  {{ item.toUpperCase() }}
                </button>
              </div>
              <p class="field__tip">
                {{ format === 'mp3' ? '体积小，适合分享与下载' : '无损，体积约为 mp3 的 5 倍' }}
              </p>
            </div>
          </div>

          <el-button
            class="go"
            type="primary"
            size="large"
            :loading="loading"
            :disabled="!text.trim()"
            @click="generate"
          >
            {{ loading ? '合成中…' : '开始合成' }}
          </el-button>
        </div>
      </section>

      <!-- ---------------- 右：输出 ---------------- -->
      <section class="panel tech-panel tech-corners" aria-labelledby="tts-output-title">
        <header class="panel__bar">
          <h2 id="tts-output-title" class="panel__title">
            <span class="panel__dot" aria-hidden="true" />
            OUTPUT
          </h2>
          <span v-if="result" class="panel__hint">
            {{ result.format.toUpperCase() }} · {{ formatSize(result.size) }}
          </span>
        </header>

        <div class="panel__body panel__body--out">
          <!-- 合成中 -->
          <div v-if="loading" class="state" aria-live="polite">
            <div class="scan" aria-hidden="true">
              <span v-for="(h, i) in BARS" :key="i" :style="{ height: `${h}%`, animationDelay: `${i * 60}ms` }" />
            </div>
            <p class="state__title">SYNTHESIZING</p>
            <p class="state__desc">
              正在调用 MiMo-V2.5-TTS 合成语音…
              <span class="state__timer">{{ elapsed.toFixed(1) }}s</span>
            </p>
            <p class="state__tip">文本越长耗时越久，500 字大约需要 45 秒</p>
          </div>

          <!-- 失败 -->
          <div v-else-if="error" class="state state--err" role="alert">
            <el-icon class="state__icon" :size="30"><WarningFilled /></el-icon>
            <p class="state__title">SYNTHESIS FAILED</p>
            <p class="state__desc">{{ error }}</p>
            <el-button @click="generate">重试</el-button>
          </div>

          <!-- 结果 -->
          <div v-else-if="result" class="result">
            <div class="player">
              <button
                type="button"
                class="player__play"
                :aria-label="playing ? '暂停' : '播放'"
                @click="togglePlay"
              >
                <el-icon :size="20">
                  <component :is="playing ? VideoPause : VideoPlay" />
                </el-icon>
              </button>

              <div class="player__body">
                <div class="player__wave" :class="{ 'is-playing': playing }" aria-hidden="true">
                  <span
                    v-for="(h, i) in BARS"
                    :key="i"
                    :style="{ height: `${h}%`, animationDelay: `${i * 40}ms` }"
                  />
                </div>

                <input
                  class="player__seek"
                  type="range"
                  min="0"
                  :max="duration || 0"
                  step="0.01"
                  :value="current"
                  :style="{ '--p': `${progress}%` }"
                  aria-label="播放进度"
                  :disabled="!duration"
                  @input="onSeek"
                >

                <div class="player__time">
                  <span>{{ fmtTime(current) }}</span>
                  <span>{{ duration ? fmtTime(duration) : '--:--' }}</span>
                </div>
              </div>
            </div>

            <audio
              ref="audioEl"
              class="sr-only"
              :src="result.url"
              preload="metadata"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onLoaded"
              @play="playing = true"
              @pause="playing = false"
              @ended="onEnded"
            />

            <dl class="meta">
              <div class="meta__row">
                <dt>音色</dt>
                <dd>{{ result.voiceLabel }}</dd>
              </div>
              <div class="meta__row">
                <dt>格式</dt>
                <dd>{{ result.format.toUpperCase() }}</dd>
              </div>
              <div class="meta__row">
                <dt>大小</dt>
                <dd>{{ formatSize(result.size) }}</dd>
              </div>
              <div class="meta__row">
                <dt>字符</dt>
                <dd>{{ result.chars }}</dd>
              </div>
              <div class="meta__row">
                <dt>耗时</dt>
                <dd>{{ (result.elapsed / 1000).toFixed(1) }}s</dd>
              </div>
            </dl>

            <p class="result__text" :title="result.text">{{ result.text }}</p>

            <div class="result__actions">
              <a class="dl" :href="result.url" :download="result.fileName">
                <el-icon :size="16"><Download /></el-icon>
                下载 {{ result.format.toUpperCase() }}
              </a>
              <button type="button" class="linkbtn" @click="generate">重新合成</button>
            </div>
          </div>

          <!-- 空态 -->
          <div v-else class="state state--idle">
            <div class="wave-idle" aria-hidden="true">
              <span v-for="(h, i) in BARS" :key="i" :style="{ height: `${h}%` }" />
            </div>
            <p class="state__title">READY</p>
            <p class="state__desc">填写左侧表单后点击「开始合成」，音频会在这里出现。</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, VideoPause, VideoPlay, WarningFilled } from '@element-plus/icons-vue'
import {
  DEFAULT_TTS_FORMAT,
  DEFAULT_TTS_VOICE,
  TTS_FORMATS,
  TTS_MAX_STYLE,
  TTS_MAX_TEXT,
  TTS_SAMPLE_TEXT,
  TTS_STYLE_PRESETS,
  TTS_VOICES,
  type TtsFormat,
  type TtsVoice,
} from '#shared/tts'

definePageMeta({
  title: '语音合成',
})

interface TtsResult {
  url: string
  fileName: string
  text: string
  voiceLabel: string
  format: TtsFormat
  size: number
  chars: number
  elapsed: number
}

/** 波形高度：写死公式保证 SSR / 客户端一致，不用 Math.random */
const BARS = Array.from({ length: 48 }, (_, i) => 14 + Math.round(Math.abs(Math.sin(i * 0.63)) * 74))

const text = ref('')
const style = ref(TTS_STYLE_PRESETS[0].value as string)
const voice = ref<TtsVoice>(DEFAULT_TTS_VOICE)
const format = ref<TtsFormat>(DEFAULT_TTS_FORMAT)

const loading = ref(false)
const error = ref('')
const result = ref<TtsResult | null>(null)
const elapsed = ref(0)

const audioEl = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const current = ref(0)
const duration = ref(0)

const progress = computed(() => (duration.value ? (current.value / duration.value) * 100 : 0))

let timer: ReturnType<typeof setInterval> | undefined

function fmtTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '00:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function revoke() {
  if (result.value?.url) URL.revokeObjectURL(result.value.url)
}

async function generate() {
  const payloadText = text.value.trim()
  if (!payloadText || loading.value) return

  // 固定本次请求的参数，避免等待期间用户改动导致元信息错位
  const usedVoice = voice.value
  const usedFormat = format.value
  const voiceLabel = TTS_VOICES.find(v => v.id === usedVoice)?.label ?? usedVoice

  loading.value = true
  error.value = ''
  elapsed.value = 0
  const startedAt = Date.now()
  timer = setInterval(() => {
    elapsed.value = (Date.now() - startedAt) / 1000
  }, 100)

  const controller = new AbortController()
  // 上游最长可能跑 4 分钟，这里给客户端留同样余量
  const abortTimer = setTimeout(() => controller.abort(), 240_000)

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: payloadText, style: style.value.trim(), voice: usedVoice, format: usedFormat }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null) as { message?: string } | null
      throw new Error(data?.message || `合成失败（HTTP ${res.status}）`)
    }

    const blob = await res.blob()
    if (!blob.size) throw new Error('没有拿到音频数据，请重试')

    revoke()
    playing.value = false
    current.value = 0
    duration.value = 0
    result.value = {
      url: URL.createObjectURL(blob),
      fileName: `tts-${/^[\w-]+$/.test(usedVoice) ? usedVoice : 'mimo'}-${Date.now()}.${usedFormat}`,
      text: payloadText,
      voiceLabel,
      format: usedFormat,
      size: blob.size,
      chars: payloadText.length,
      elapsed: Date.now() - startedAt,
    }
  }
  catch (err) {
    const e = err as { name?: string; message?: string }
    if (e?.name === 'AbortError') error.value = '请求超时，请缩短文本后重试'
    else if (e?.name === 'TypeError') error.value = '网络异常，无法连接服务端，请检查网络后重试'
    else error.value = e?.message || '合成失败，请稍后重试'
    revoke()
    result.value = null
  }
  finally {
    clearTimeout(abortTimer)
    if (timer) clearInterval(timer)
    timer = undefined
    loading.value = false
  }
}

function togglePlay() {
  const el = audioEl.value
  if (!el) return
  if (el.paused) el.play().catch(() => {})
  else el.pause()
}

function onTimeUpdate() {
  current.value = audioEl.value?.currentTime ?? 0
}

function onLoaded() {
  const d = audioEl.value?.duration
  duration.value = Number.isFinite(d) ? (d as number) : 0
}

function onEnded() {
  playing.value = false
  current.value = 0
  if (audioEl.value) audioEl.value.currentTime = 0
}

function onSeek(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  current.value = value
  if (audioEl.value) audioEl.value.currentTime = value
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  revoke()
})
</script>

<style scoped lang="scss">
.tts {
  --panel-pad: clamp(14px, 1.6vw, 20px);
}

/* ---------------- 页头统计 ---------------- */
.stat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid $line;
  border-radius: $radius-sm;
  background: rgba(8, 15, 26, 0.6);
}

.stat__val {
  font-family: $font-mono;
  font-size: 0.8rem;
  font-weight: 500;
  color: $primary;
}

/* ---------------- 布局 ---------------- */
.tts__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  align-items: start;
  gap: clamp(12px, 1.6vw, 20px);
}

.panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.panel__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px var(--panel-pad);
  border-bottom: 1px solid $line;
  background: rgba(122, 190, 255, 0.04);
}

.panel__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: $font-mono;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: $text-dim;
}

.panel__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: $primary;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.8);
}

.panel__hint {
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  color: $faint;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel__body {
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 1.8vw, 20px);
  padding: var(--panel-pad);
}

.panel__body--out {
  position: relative;
  flex: 1;
  min-height: 380px;
  justify-content: center;
}

/* ---------------- 表单 ---------------- */
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.field__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: $text-dim;
}

.field__no {
  font-family: $font-mono;
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: $primary;
  padding: 1px 5px;
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 4px;
  background: rgba(34, 211, 238, 0.07);
}

.field__count {
  font-family: $font-mono;
  font-size: 0.68rem;
  color: $faint;
  font-variant-numeric: tabular-nums;

  &.is-near {
    color: $warn;
  }
}

.field__opt {
  font-family: $font-mono;
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  color: $faint;
  padding: 1px 6px;
  border: 1px solid $line;
  border-radius: 999px;
}

.field__tip {
  margin: 0;
  font-size: 0.7rem;
  color: $faint;
}

.field__foot {
  display: flex;
  align-items: center;
  gap: 14px;
}

.field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(12px, 1.6vw, 20px);
}

.linkbtn {
  padding: 0;
  border: 0;
  background: none;
  font-size: 0.74rem;
  color: $muted;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover:not(:disabled) {
    color: $primary-hover;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

/* 风格 chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 4px 11px;
  border: 1px solid $line;
  border-radius: 999px;
  background: rgba(8, 15, 26, 0.6);
  font-size: 0.74rem;
  color: $muted;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: $text;
    border-color: rgba(34, 211, 238, 0.4);
  }

  &.is-on {
    color: $primary-hover;
    border-color: rgba(34, 211, 238, 0.55);
    background: rgba(34, 211, 238, 0.12);
  }
}

/* 格式分段按钮 */
.segs {
  display: inline-flex;
  padding: 3px;
  border: 1px solid $line;
  border-radius: $radius-sm;
  background: rgba(8, 15, 26, 0.7);
}

.seg {
  flex: 1;
  padding: 6px 0;
  border: 0;
  border-radius: 6px;
  background: none;
  font-family: $font-mono;
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  color: $muted;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: $text;
  }

  &.is-on {
    color: #04141a;
    background-image: linear-gradient(135deg, #7df0ff, $primary 70%);
    font-weight: 700;
  }
}

.opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.opt__label {
  color: $text-dim;
}

.opt__id {
  font-family: $font-mono;
  font-size: 0.68rem;
  color: $faint;
}

.w-full {
  width: 100%;
}

.go {
  width: 100%;
  height: 44px;
  margin-top: 2px;
  font-size: 0.92rem;
  letter-spacing: 0.06em;
}

/* ---------------- 输出状态 ---------------- */
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: clamp(16px, 3vw, 28px) 0;
}

.state__icon {
  color: $danger;
}

.state__title {
  margin: 0;
  font-family: $font-display;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: $primary;
}

.state--idle .state__title {
  color: $faint;
}

.state--err .state__title {
  color: $danger;
}

.state__desc {
  margin: 0;
  max-width: 36ch;
  font-size: 0.82rem;
  line-height: 1.7;
  color: $muted;
}

.state__timer {
  font-family: $font-mono;
  color: $primary;
  margin-left: 4px;
}

.state__tip {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: $faint;
}

/* 合成中的扫描波形 */
.scan,
.wave-idle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 100%;
  height: 64px;
  margin-bottom: 6px;

  span {
    width: 3px;
    border-radius: 999px;
    background: linear-gradient(180deg, $primary, rgba(99, 102, 241, 0.5));
  }
}

.scan span {
  animation: scan 1.1s ease-in-out infinite;
  opacity: 0.85;
}

@keyframes scan {
  0%,
  100% {
    transform: scaleY(0.35);
    opacity: 0.35;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.wave-idle span {
  background: rgba(122, 190, 255, 0.22);
}

/* ---------------- 播放器 ---------------- */
.result {
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 1.8vw, 18px);
}

.player {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid $line;
  border-radius: $radius;
  background: linear-gradient(150deg, rgba(34, 211, 238, 0.07), rgba(8, 13, 23, 0.85));
}

.player__play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid rgba(34, 211, 238, 0.55);
  border-radius: 999px;
  color: #04141a;
  cursor: pointer;
  background: linear-gradient(135deg, #7df0ff, $primary 70%);
  box-shadow: 0 0 22px rgba(34, 211, 238, 0.35);
  transition: transform 0.2s $ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 30px rgba(34, 211, 238, 0.55);
  }

  &:active {
    transform: translateY(0);
  }
}

.player__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.player__wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 34px;

  span {
    flex: 1;
    min-width: 2px;
    border-radius: 999px;
    background: rgba(122, 190, 255, 0.22);
    transition: background-color 0.3s ease;
  }

  &.is-playing span {
    background: linear-gradient(180deg, $primary, rgba(99, 102, 241, 0.55));
    animation: bar-bounce 1.2s ease-in-out infinite;
  }
}

@keyframes bar-bounce {
  0%,
  100% {
    transform: scaleY(0.55);
  }

  50% {
    transform: scaleY(1);
  }
}

.player__seek {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  margin: 0;
  border-radius: 999px;
  cursor: pointer;
  background: linear-gradient(
    90deg,
    $primary var(--p, 0%),
    rgba(122, 190, 255, 0.16) var(--p, 0%)
  );

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border: 2px solid $primary;
    border-radius: 999px;
    background: #04141a;
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.8);
  }

  &::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border: 2px solid $primary;
    border-radius: 999px;
    background: #04141a;
  }
}

.player__time {
  display: flex;
  justify-content: space-between;
  font-family: $font-mono;
  font-size: 0.68rem;
  color: $muted;
  font-variant-numeric: tabular-nums;
}

/* 元信息 */
.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(86px, 1fr));
  gap: 8px;
  margin: 0;
}

.meta__row {
  padding: 8px 10px;
  border: 1px solid $line;
  border-radius: $radius-sm;
  background: rgba(8, 15, 26, 0.55);

  dt {
    font-family: $font-mono;
    font-size: 0.6rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $faint;
  }

  dd {
    margin: 3px 0 0;
    font-family: $font-mono;
    font-size: 0.78rem;
    color: $text-dim;
    word-break: break-all;
  }
}

.result__text {
  margin: 0;
  padding: 10px 12px;
  border-left: 2px solid rgba(34, 211, 238, 0.5);
  background: rgba(34, 211, 238, 0.04);
  border-radius: 0 $radius-sm $radius-sm 0;
  font-size: 0.78rem;
  line-height: 1.7;
  color: $muted;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result__actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.dl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 18px;
  border: 1px solid rgba(34, 211, 238, 0.6);
  border-radius: $radius-sm;
  font-size: 0.84rem;
  font-weight: 600;
  color: #04141a;
  text-decoration: none;
  background: linear-gradient(135deg, #7df0ff, $primary 70%);
  box-shadow: 0 6px 20px rgba(34, 211, 238, 0.22);
  transition: transform 0.2s $ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 26px rgba(34, 211, 238, 0.38);
  }
}

/* ---------------- 断点 ---------------- */
@media (max-width: 1023px) {
  .tts__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .panel__body--out {
    min-height: 300px;
  }
}

@media (max-width: 640px) {
  .field-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .panel__hint {
    display: none;
  }

  .meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .player {
    gap: 10px;
    padding: 12px;
  }

  .player__play {
    width: 40px;
    height: 40px;
  }

  .player__wave span:nth-child(2n) {
    display: none;
  }

  .dl {
    flex: 1 1 auto;
  }
}
</style>

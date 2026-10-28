<template>
  <div class="hls">
    <video
      ref="videoEl"
      class="hls__video"
      autoplay
      muted
      playsinline
      controls
    />

    <!-- 扫描线 + 四角装饰 -->
    <span class="hls__scanlines" aria-hidden="true" />
    <span class="hls__scan" aria-hidden="true" />
    <span class="hls__corners" aria-hidden="true" />

    <!-- 状态遮罩 -->
    <transition name="fade">
      <div v-if="status !== 'playing'" class="hls__overlay">
        <el-icon v-if="status === 'loading'" :size="24" class="spin">
          <Loading />
        </el-icon>
        <el-icon v-else-if="status === 'error'" :size="24" class="hls__icon--error">
          <WarnTriangleFilled />
        </el-icon>
        <el-icon v-else :size="24">
          <VideoCamera />
        </el-icon>
        <span class="hls__status">{{ statusText }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import Hls from 'hls.js'
import { Loading, WarnTriangleFilled, VideoCamera } from '@element-plus/icons-vue'

const props = defineProps<{
  src: string
}>()

const videoEl = ref<HTMLVideoElement>()
let hls: Hls | null = null
const status = ref<'idle' | 'loading' | 'playing' | 'error'>('idle')

const statusText = computed(() => {
  switch (status.value) {
    case 'loading': return 'CONNECTING'
    case 'error': return 'SIGNAL LOST'
    case 'playing': return 'LIVE'
    default: return 'STANDBY'
  }
})

function load(url: string) {
  if (!url) {
    status.value = 'idle'
    return
  }
  const video = videoEl.value
  if (!video) return

  status.value = 'loading'

  // 优先使用浏览器原生 HLS（Safari / iOS）
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    video.load()
    status.value = 'playing'
    return
  }

  // 其余浏览器用 hls.js
  if (Hls.isSupported()) {
    hls?.destroy()
    hls = new Hls({ lowLatencyMode: true })
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      status.value = 'playing'
      video.play().catch(() => {})
    })
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) {
        status.value = 'error'
        hls?.destroy()
        hls = null
      }
    })
    hls.loadSource(url)
    hls.attachMedia(video)
    status.value = 'playing'
  } else {
    status.value = 'error'
  }
}

onMounted(() => load(props.src))

watch(
  () => props.src,
  (url) => load(url),
)

onBeforeUnmount(() => {
  hls?.destroy()
  hls = null
})
</script>

<style scoped lang="scss">
.hls {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background:
    radial-gradient(120% 120% at 50% 0%, #0d1a2b, #05070e 75%);
}

.hls__video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background: #04060b;
}

/* 细密扫描线：轻微提升“监视器”质感 */
.hls__scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(122, 190, 255, 0.05) 0 1px,
    transparent 1px 3px
  );
  mix-blend-mode: screen;
  opacity: 0.5;
}

/* 缓慢下移的高亮扫描带 */
.hls__scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 24%;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(34, 211, 238, 0.07),
    transparent
  );
  animation: hls-scan 6s linear infinite;
}

@keyframes hls-scan {
  from { transform: translateY(-30%); }
  to { transform: translateY(430%); }
}

.hls__corners {
  position: absolute;
  inset: 8px;
  pointer-events: none;
  @include tech-corners(rgba(34, 211, 238, 0.4), 16px, 1px);
}

.hls__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(232, 241, 251, 0.85);
  background: linear-gradient(180deg, rgba(4, 7, 14, 0.55), rgba(4, 7, 14, 0.78));
  pointer-events: none;
}

.hls__icon--error {
  color: $danger;
}

.hls__status {
  font-family: $font-mono;
  font-size: 0.64rem;
  letter-spacing: 0.22em;
  color: rgba(232, 241, 251, 0.7);
}

.spin {
  animation: hls-spin 1s linear infinite;
  color: $primary;
}

@keyframes hls-spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

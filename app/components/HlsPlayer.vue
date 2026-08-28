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

    <!-- 状态遮罩 -->
    <transition name="fade">
      <div v-if="status !== 'playing'" class="hls__overlay">
        <el-icon v-if="status === 'loading'" :size="28" class="spin">
          <Loading />
        </el-icon>
        <el-icon v-else-if="status === 'error'" :size="28">
          <WarnTriangleFilled />
        </el-icon>
        <el-icon v-else :size="28">
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
    case 'loading': return '正在连接…'
    case 'error': return '视频流加载失败'
    case 'playing': return '直播中'
    default: return '等待视频流'
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
  background: #0b1220;
  border-radius: 0.75rem;
  overflow: hidden;
}

.hls__video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background: #0b1220;
}

.hls__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.85);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45));
  pointer-events: none;
}

.hls__status {
  font-size: 0.85rem;
}

.spin {
  animation: hls-spin 1s linear infinite;
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

<template>
  <!-- 首页：平板桌面 app 风格 + 小清新背景 + 毛玻璃 -->
  <div class="home" :style="bgStyle">
    <div class="home__veil" />

    <div class="home__content">
      <header class="home__hero">
        <h1 class="home__title">XiaoHome</h1>
        <p class="home__sub">欢迎回来，选择一个应用开始吧</p>
      </header>

      <!-- 应用网格：Tailwind 响应式断点，自适应列数 -->
      <nav
        class="grid w-full grid-cols-2 justify-items-center gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
        aria-label="应用列表"
      >
        <button
          v-for="app in apps"
          :key="app.to"
          type="button"
          class="tile"
          :class="app.tone"
          @click="navigateTo(app.to)"
        >
          <span class="tile__icon">
            <el-icon :size="30"><component :is="app.icon" /></el-icon>
          </span>
          <span class="tile__name">{{ app.name }}</span>
          <span class="tile__desc">{{ app.desc }}</span>
        </button>
      </nav>

      <footer class="home__foot">
        <span>{{ year }}桌面端体验</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, InfoFilled, VideoCamera } from '@element-plus/icons-vue'

interface AppItem {
  name: string
  desc: string
  to: string
  icon: any
  tone: 'tile--green' | 'tile--blue' | 'tile--purple'
}

const apps: AppItem[] = [
  { name: '用户管理', desc: '登记 · 编辑 · 删除', to: '/users', icon: User, tone: 'tile--green' },
  { name: '监控', desc: 'HLS 实时视频流', to: '/monitor', icon: VideoCamera, tone: 'tile--blue' },
  { name: '关于', desc: '了解XiaoHome', to: '/about', icon: InfoFilled, tone: 'tile--purple' },
]

const year = new Date().getFullYear()

/* 小清新风格背景图，按规范走 text_to_image 接口 */
const bgPrompt =
  'A serene fresh spring morning nature scene, soft pastel green foliage and tiny white flowers, gentle sunlight bokeh, clean minimalist, light and airy watercolor texture, no text, no people'
const bgUrl = computed(
  () =>
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      bgPrompt,
    )}&image_size=landscape_16_9`,
)
const bgStyle = computed(() => ({
  backgroundImage: `url("${bgUrl.value}")`,
}))
</script>

<style scoped lang="scss">
.home {
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: stretch;
  overflow: hidden;
}

/* 毛玻璃遮罩 + 柔和清新色调 */
.home__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(236, 253, 245, 0.55),
    rgba(224, 242, 254, 0.45)
  );
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.home__content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--app-max-width, 1600px);
  margin: 0 auto;
  padding: 2.5rem 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.home__hero {
  text-align: center;
  margin-bottom: 2.5rem;
}
.home__title {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #0f172a;
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.6);
}
.home__sub {
  margin: 0.6rem 0 0;
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  color: #334155;
}

/* 单个应用卡片：毛玻璃 */
.tile {
  width: 100%;
  max-width: 220px;
  aspect-ratio: 3 / 4;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.tile:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14);
}
.tile:active {
  transform: translateY(-1px) scale(0.99);
}

.tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  color: #fff;
  margin-bottom: 0.25rem;
}
.tile--green .tile__icon { background: linear-gradient(135deg, #6ee7b7, #10b981); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }
.tile--blue  .tile__icon { background: linear-gradient(135deg, #7dd3fc, #3b82f6); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }
.tile--purple .tile__icon { background: linear-gradient(135deg, #c4b5fd, #8b5cf6); box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4); }

.tile__name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}
.tile__desc {
  font-size: 0.8rem;
  color: #475569;
}

.home__foot {
  margin-top: 2.5rem;
  font-size: 0.8rem;
  color: #475569;
}
</style>

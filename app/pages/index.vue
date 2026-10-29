<template>
  <div class="page-wrap home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero__main">
        <p class="hero__eyebrow">
          <span class="status-dot" />
          <span>SYSTEM ONLINE</span>
          <span class="hero__sep">/</span>
          <span>NUXT 4 CONSOLE</span>
        </p>

        <h1 class="hero__title">XiaoHome</h1>
        <p class="hero__lead">
          一个入口直达所有内部工具 —— 用户数据、实时视频流、语音合成与系统信息，
          桌面、平板、手机同一套界面自适应。
        </p>

        <div class="hero__actions">
          <el-button v-if="isAdmin" type="primary" @click="navigateTo('/users')">
            进入用户管理
          </el-button>
          <el-button :type="isAdmin ? 'default' : 'primary'" @click="navigateTo('/monitor')">
            查看监控
          </el-button>
        </div>
      </div>

      <!-- 系统信息面板：数据均来自真实运行环境 -->
      <aside class="hero__panel tech-panel tech-corners" aria-label="系统信息">
        <div class="term__bar">
          <span class="term__lights" aria-hidden="true">
            <i /> <i /> <i />
          </span>
          <span class="tech-label">SYSTEM</span>
        </div>

        <dl class="term__body">
          <div class="term__row">
            <dt>$ modules</dt>
            <dd>{{ apps.length }} loaded</dd>
          </div>
          <div class="term__row">
            <dt>$ viewport</dt>
            <dd class="term__accent">{{ bp.label }} · {{ bp.width.value }}px</dd>
          </div>
          <div class="term__row">
            <dt>$ local time</dt>
            <dd>{{ clock || '--:--:--' }}</dd>
          </div>
          <div class="term__row">
            <dt>$ runtime</dt>
            <dd>{{ env }} · nuxt 4</dd>
          </div>
          <div class="term__row">
            <dt>$ endpoints</dt>
            <dd class="term__dim">/api/users · /api/tts</dd>
          </div>
        </dl>

        <p class="term__foot">
          <span class="term__caret" aria-hidden="true">▍</span>
          ready for input
        </p>
      </aside>
    </section>

    <!-- 模块入口 -->
    <section class="modules" aria-labelledby="modules-title">
      <div class="modules__head">
        <h2 id="modules-title" class="modules__title">
          <span class="modules__bar" aria-hidden="true" />
          功能模块
        </h2>
        <span class="tech-label">{{ apps.length }} MODULES</span>
      </div>

      <div class="modules__grid">
        <button
          v-for="(app, i) in apps"
          :key="app.to"
          type="button"
          class="tile tech-panel tech-corners"
          :class="`tile--${app.tone}`"
          @click="navigateTo(app.to)"
        >
          <span class="tile__idx">{{ String(i + 1).padStart(2, '0') }}</span>

          <span class="tile__icon" aria-hidden="true">
            <el-icon :size="24"><component :is="app.icon" /></el-icon>
          </span>

          <span class="tile__name">{{ app.name }}</span>
          <span class="tile__desc">{{ app.desc }}</span>

          <span class="tile__cta">
            OPEN
            <span class="tile__arrow" aria-hidden="true">→</span>
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, Microphone, User, VideoCamera } from '@element-plus/icons-vue'

definePageMeta({
  title: '总览',
})

interface AppItem {
  name: string
  desc: string
  to: string
  icon: any
  tone: 'cyan' | 'indigo' | 'violet' | 'mint'
}

const bp = useBreakpoint()
const clock = useClock()
const { isAdmin } = useAuth()

const apps = computed<AppItem[]>(() => [
  { name: '用户管理', desc: '登记 · 编辑 · 删除，支持分页与移动端卡片视图', to: '/users', icon: User, tone: 'cyan' },
  { name: '监控', desc: 'HLS 实时视频流接入与多路画面切换', to: '/monitor', icon: VideoCamera, tone: 'indigo' },
  { name: '语音合成', desc: '文本转语音，多音色合成，在线试听与下载', to: '/tts', icon: Microphone, tone: 'violet' },
  { name: '关于', desc: '技术栈、运行环境与版本信息', to: '/about', icon: InfoFilled, tone: 'mint' },
].filter(item => item.to !== '/users' || isAdmin.value))

const env = computed(() => (import.meta.dev ? 'DEV' : 'PROD'))
</script>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 4vw, 48px);
}

/* ---------------- Hero ---------------- */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(24px, 4vw, 56px);
  padding: clamp(8px, 2vw, 28px) 0 clamp(4px, 1vw, 12px);
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.2em;
  color: $muted;
}

.hero__sep {
  color: rgba(122, 190, 255, 0.3);
}

.hero__title {
  margin: 0;
  font-family: $font-display;
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.05;
  background: linear-gradient(120deg, #ffffff 10%, #a5f3fd 45%, $primary 70%, #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 26px rgba(34, 211, 238, 0.22));
}

.hero__lead {
  margin: 16px 0 0;
  max-width: 46ch;
  font-size: clamp(0.88rem, 1.4vw, 1rem);
  line-height: 1.75;
  color: $muted;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

/* ---------------- 终端面板 ---------------- */
.hero__panel {
  padding: 0;
  overflow: hidden;
  font-family: $font-mono;
}

.term__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid $line;
  background: rgba(122, 190, 255, 0.04);
}

.term__lights {
  display: inline-flex;
  gap: 5px;

  i {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgba(122, 190, 255, 0.25);

    &:first-child {
      background: rgba(248, 113, 113, 0.55);
    }

    &:nth-child(2) {
      background: rgba(251, 191, 36, 0.45);
    }

    &:last-child {
      background: rgba(52, 211, 153, 0.5);
    }
  }
}

.term__body {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 16px 14px;
}

.term__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  font-size: 0.76rem;

  dt {
    color: $faint;
    white-space: nowrap;
  }

  dd {
    margin: 0;
    color: $text-dim;
    text-align: right;
    word-break: break-all;
  }
}

.term__accent {
  color: $primary !important;
}

.term__dim {
  color: $muted !important;
}

.term__foot {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 10px 14px 12px;
  border-top: 1px solid $line;
  font-size: 0.7rem;
  color: $faint;
}

.term__caret {
  color: $primary;
  animation: caret-blink 1.4s steps(2, start) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

/* ---------------- 模块 ---------------- */
.modules__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.modules__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.02rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: $text;
}

.modules__bar {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, $primary, $accent-2);
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
}

.modules__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
  gap: clamp(12px, 1.6vw, 20px);
}

/* 单个模块卡片 */
.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-height: 176px;
  padding: 20px 20px 18px;
  text-align: left;
  cursor: pointer;
  color: inherit;
  font: inherit;
  transition: transform 0.28s $ease, border-color 0.28s ease, box-shadow 0.28s ease;

  --tone: #{$primary};
  --tone-soft: rgba(34, 211, 238, 0.14);

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(34, 211, 238, 0.35);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 20px 44px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(34, 211, 238, 0.12);

    &::after {
      opacity: 1;
    }

    .tile__arrow {
      transform: translateX(4px);
    }
  }

  &::after {
    opacity: 0.55;
  }
}

.tile--indigo {
  --tone: #818cf8;
  --tone-soft: rgba(129, 140, 248, 0.14);
}

.tile--violet {
  --tone: #c4b5fd;
  --tone-soft: rgba(196, 181, 253, 0.14);
}

.tile--mint {
  --tone: #5eead4;
  --tone-soft: rgba(94, 234, 212, 0.14);
}

.tile__idx {
  position: absolute;
  top: 16px;
  right: 18px;
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  color: $faint;
}

.tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
  border: 1px solid color-mix(in srgb, var(--tone) 40%, transparent);
  border-radius: 11px;
  color: var(--tone);
  background: var(--tone-soft);
  box-shadow: 0 0 20px color-mix(in srgb, var(--tone) 14%, transparent);
}

.tile__name {
  font-size: 1.02rem;
  font-weight: 600;
  color: $text;
}

.tile__desc {
  font-size: 0.8rem;
  line-height: 1.6;
  color: $muted;
}

.tile__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 14px;
  font-family: $font-mono;
  font-size: 0.64rem;
  letter-spacing: 0.2em;
  color: var(--tone);
}

.tile__arrow {
  transition: transform 0.28s $ease;
}

/* ---------------- 断点 ---------------- */
@media (max-width: 1023px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    gap: 26px;
  }

  .hero__panel {
    max-width: 520px;
  }
}

@media (max-width: 640px) {
  .hero__title {
    font-size: clamp(2.1rem, 11vw, 2.8rem);
  }

  .hero__actions {
    flex-direction: column;
    align-items: stretch;

    :deep(.el-button + .el-button) {
      margin-left: 0;
    }
  }

  .tile {
    min-height: 150px;
    padding: 18px 16px 16px;
  }

  .modules__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

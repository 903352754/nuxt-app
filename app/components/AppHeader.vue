<template>
  <header class="hd">
    <div class="hd__inner">
      <!-- 品牌 -->
      <NuxtLink to="/" class="brand" aria-label="XiaoHome 首页">
        <span class="brand__mark" aria-hidden="true">
          <el-icon :size="17"><Cpu /></el-icon>
        </span>
        <span class="brand__text">
          <strong class="brand__name">XiaoHome</strong>
          <span class="brand__sub">CONTROL CENTER</span>
        </span>
      </NuxtLink>

      <!-- 桌面导航 -->
      <nav class="nav" aria-label="主导航">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="nav__link"
          :class="{ 'is-active': isActive(item.to) }"
        >
          <el-icon :size="15"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- 右侧 -->
      <div class="hd__right">
        <span class="hd__clock">{{ clock || '--:--:--' }}</span>

        <el-dropdown trigger="click" @command="onCommand">
          <button class="avatar" type="button" aria-label="用户菜单">
            <el-icon :size="16"><UserFilled /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="home">返回首页</el-dropdown-item>
              <el-dropdown-item command="about">关于</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <button
          class="menu-btn"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          :aria-label="menuOpen ? '关闭导航' : '打开导航'"
          @click="menuOpen = !menuOpen"
        >
          <el-icon :size="17">
            <component :is="menuOpen ? Close : Expand" />
          </el-icon>
        </button>
      </div>
    </div>

    <!-- 移动端导航面板 -->
    <transition name="drop">
      <nav v-if="menuOpen" id="mobile-nav" class="mnav" aria-label="移动端主导航">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="mnav__link"
          :class="{ 'is-active': isActive(item.to) }"
          @click="menuOpen = false"
        >
          <el-icon :size="16"><component :is="item.icon" /></el-icon>
          <span class="mnav__label">{{ item.label }}</span>
          <span class="mnav__idx">{{ item.index }}</span>
        </NuxtLink>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import {
  Close,
  Cpu,
  Expand,
  HomeFilled,
  InfoFilled,
  Microphone,
  User,
  UserFilled,
  VideoCamera,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const menuOpen = ref(false)
const clock = useClock()

const nav = [
  { label: '总览', to: '/', icon: HomeFilled, index: '00' },
  { label: '用户管理', to: '/users', icon: User, index: '01' },
  { label: '监控', to: '/monitor', icon: VideoCamera, index: '02' },
  { label: '语音合成', to: '/tts', icon: Microphone, index: '03' },
  { label: '关于', to: '/about', icon: InfoFilled, index: '04' },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

// 路由变化时收起移动端菜单
watch(() => route.fullPath, () => (menuOpen.value = false))

function onCommand(cmd: string) {
  switch (cmd) {
    case 'home':
      navigateTo('/')
      break
    case 'about':
      navigateTo('/about')
      break
    case 'logout':
      ElMessage.info('退出登录（演示）')
      break
  }
}
</script>

<style scoped lang="scss">
.hd {
  position: relative;
  width: 100%;
}

.hd__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  height: var(--app-header-height);
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding: 0 var(--app-gutter);
}

/* ---------- 品牌 ---------- */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  min-width: 0;
}

.brand__mark {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  color: $primary;
  border: 1px solid rgba(34, 211, 238, 0.4);
  border-radius: 9px;
  background: linear-gradient(150deg, rgba(34, 211, 238, 0.18), rgba(99, 102, 241, 0.12));
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.18), inset 0 0 12px rgba(34, 211, 238, 0.08);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  min-width: 0;
}

.brand__name {
  font-family: $font-display;
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: $text;
  white-space: nowrap;
}

.brand__sub {
  font-family: $font-mono;
  font-size: 0.55rem;
  letter-spacing: 0.22em;
  color: $faint;
  white-space: nowrap;
}

/* ---------- 桌面导航 ---------- */
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  margin-right: auto;
  padding: 4px;
  border: 1px solid rgba(122, 190, 255, 0.09);
  border-radius: 999px;
  background: rgba(11, 18, 32, 0.55);
}

.nav__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 999px;
  color: $muted;
  font-size: 0.85rem;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: $text;
    background: rgba(122, 190, 255, 0.07);
  }

  &.is-active {
    color: #04141a;
    background: linear-gradient(135deg, #7df0ff, $primary 70%);
    box-shadow: 0 4px 16px rgba(34, 211, 238, 0.28);

    :deep(.el-icon) {
      color: #04141a;
    }
  }
}

/* ---------- 右侧 ---------- */
.hd__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.hd__clock {
  font-family: $font-mono;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  color: $muted;
  padding: 5px 9px;
  border: 1px solid rgba(122, 190, 255, 0.1);
  border-radius: 6px;
  background: rgba(11, 18, 32, 0.6);
  font-variant-numeric: tabular-nums;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 9px;
  cursor: pointer;
  color: $primary;
  font-family: $font-display;
  font-size: 0.85rem;
  font-weight: 700;
  background: linear-gradient(150deg, rgba(34, 211, 238, 0.16), rgba(99, 102, 241, 0.14));
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 18px rgba(34, 211, 238, 0.3);
  }
}

.menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  color: $text-dim;
  cursor: pointer;
  border: 1px solid $line-strong;
  border-radius: 8px;
  background: rgba(11, 18, 32, 0.7);
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: $primary-hover;
    border-color: rgba(34, 211, 238, 0.5);
  }
}

/* ---------- 移动端面板 ---------- */
.mnav {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 60;
  display: grid;
  gap: 4px;
  padding: 10px var(--app-gutter) 16px;
  border-bottom: 1px solid $line;
  // 注意：这里不能用 backdrop-filter —— 祖先 .shell__top 已有 backdrop-filter，
  // 嵌套使用会让面板背景变透明、正文透出来。直接给不透明底色。
  background: #060a12;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55);
}

.mnav__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: $text-dim;
  font-size: 0.92rem;
  text-decoration: none;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(122, 190, 255, 0.06);
  }

  &.is-active {
    color: $primary-hover;
    border-color: rgba(34, 211, 238, 0.35);
    background: rgba(34, 211, 238, 0.1);
  }
}

.mnav__label {
  flex: 1;
}

.mnav__idx {
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  color: $faint;
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s $ease;
  transform-origin: top center;
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ---------- 断点 ---------- */
@media (max-width: 960px) {
  .nav {
    display: none;
  }

  .menu-btn {
    display: inline-flex;
  }

  .hd__right {
    margin-left: auto;
  }
}

@media (max-width: 640px) {
  .brand__sub {
    display: none;
  }

  .hd__clock {
    display: none;
  }

  .brand__name {
    font-size: 0.9rem;
  }
}
</style>

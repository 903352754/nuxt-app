<template>
  <div class="auth">
    <!-- 顶栏：只保留品牌与运行状态，登录页不需要主导航 -->
    <header class="auth__top">
      <NuxtLink to="/" class="auth__brand" aria-label="XiaoHome 首页">
        <span class="auth__mark" aria-hidden="true">
          <el-icon :size="17"><Cpu /></el-icon>
        </span>
        <span class="auth__brandText">
          <strong class="auth__name">XiaoHome</strong>
          <span class="auth__sub">CONTROL CENTER</span>
        </span>
      </NuxtLink>

      <span class="auth__status">
        <span class="status-dot" aria-hidden="true" />
        <span class="tech-label">SYSTEM ONLINE</span>
      </span>
    </header>

    <main class="auth__main">
      <slot />
    </main>

    <footer class="auth__foot">
      <span class="tech-label">XIAOHOME / CONSOLE</span>
      <span class="auth__sep" aria-hidden="true">·</span>
      <span class="tech-label">NUXT 4 · v1.0</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Cpu } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.auth {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.auth__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding: clamp(16px, 2.4vw, 24px) var(--app-gutter);
}

.auth__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  min-width: 0;
}

.auth__mark {
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

.auth__brandText {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  min-width: 0;
}

.auth__name {
  font-family: $font-display;
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: $text;
  white-space: nowrap;
}

.auth__sub {
  font-family: $font-mono;
  font-size: 0.55rem;
  letter-spacing: 0.22em;
  color: $faint;
  white-space: nowrap;
}

.auth__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border: 1px solid $line;
  border-radius: 999px;
  background: rgba(8, 15, 26, 0.6);
  white-space: nowrap;
}

.auth__main {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding: clamp(12px, 2vw, 24px) var(--app-gutter) clamp(24px, 3vw, 40px);
}

.auth__foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0 var(--app-gutter) clamp(18px, 2.4vw, 28px);
  color: $faint;
}

.auth__sep {
  color: $faint;
  opacity: 0.6;
}

@media (max-width: 640px) {
  .auth__sub {
    display: none;
  }

  .auth__status .tech-label {
    display: none;
  }

  .auth__status {
    padding: 7px;
  }
}
</style>

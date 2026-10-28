<template>
  <div class="shell">
    <!-- 顶栏 + 面包屑：整体吸顶 -->
    <div class="shell__top">
      <AppHeader />
      <AppBreadcrumb />
    </div>

    <main class="shell__main">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.shell {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.shell__top {
  position: sticky;
  top: 0;
  z-index: 80;
  background: rgba(5, 7, 14, 0.82);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border-bottom: 1px solid $line;
}

.shell__main {
  flex: 1 1 auto;
  min-width: 0;
}
</style>

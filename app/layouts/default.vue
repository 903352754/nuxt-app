<template>
  <!-- 整体结构：header + main -->
  <div class="app-shell flex flex-col h-full">
    <AppHeader />
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
/* 结构由 Tailwind 负责，此处仅兜底 */
.app-main{
  height: calc(100% - 64px);
}
</style>

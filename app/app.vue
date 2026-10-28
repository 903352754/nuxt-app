<template>
  <div class="nuxt-app w-full h-full">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// 页面标题统一由 definePageMeta({ title }) 驱动
useHead(() => ({
  title: route.meta.title ? `${route.meta.title} · XiaoHome` : 'XiaoHome',
}))
</script>

<style lang="scss" scoped></style>

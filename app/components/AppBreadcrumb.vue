<template>
  <nav class="crumbs" aria-label="面包屑导航">
    <ol class="crumbs__list">
      <li v-for="(c, i) in items" :key="`${c.to}-${i}`" class="crumbs__item">
        <NuxtLink v-if="!c.current" :to="c.to" class="crumbs__link">
          <el-icon v-if="i === 0" :size="13" class="crumbs__home"><HomeFilled /></el-icon>
          <span>{{ c.label }}</span>
        </NuxtLink>
        <span v-else class="crumbs__current" aria-current="page">{{ c.label }}</span>

        <span v-if="i < items.length - 1" class="crumbs__sep" aria-hidden="true">/</span>
      </li>
    </ol>

    <div class="crumbs__meta">
      <span class="crumbs__path">{{ route.path }}</span>
      <span class="crumbs__status">
        <span class="status-dot" />
        ONLINE
      </span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()
const items = useBreadcrumbs()
</script>

<style scoped lang="scss">
.crumbs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: var(--app-breadcrumb-height);
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding: 0 var(--app-gutter);
  border-top: 1px solid rgba(122, 190, 255, 0.07);
}

.crumbs__list {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.crumbs__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 0.78rem;
}

.crumbs__link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 4px;
  border-radius: 4px;
  color: $muted;
  text-decoration: none;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: $primary-hover;
    background: rgba(34, 211, 238, 0.08);
  }
}

.crumbs__home {
  opacity: 0.85;
}

.crumbs__current {
  padding: 2px 4px;
  color: $text;
  font-weight: 600;
}

.crumbs__sep {
  color: rgba(122, 190, 255, 0.28);
  font-family: $font-mono;
  font-size: 0.72rem;
}

.crumbs__meta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.crumbs__path {
  font-family: $font-mono;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  color: $faint;
}

.crumbs__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: $font-mono;
  font-size: 0.64rem;
  letter-spacing: 0.18em;
  color: $ok;
}

@media (max-width: 767px) {
  .crumbs {
    height: 2.25rem;
    gap: 10px;
  }

  .crumbs__item {
    font-size: 0.74rem;
  }

  .crumbs__meta {
    gap: 8px;
  }

  .crumbs__path {
    display: none;
  }

  .crumbs__status {
    font-size: 0.58rem;
    letter-spacing: 0.12em;
  }
}

@media (max-width: 400px) {
  .crumbs__status {
    display: none;
  }
}
</style>

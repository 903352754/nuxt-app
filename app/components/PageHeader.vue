<template>
  <header class="ph">
    <div class="ph__main">
      <div class="ph__meta">
        <span v-if="index" class="ph__index">{{ index }}</span>
        <span class="tech-label">{{ kicker }}</span>
        <span class="ph__rule" aria-hidden="true" />
      </div>

      <h1 class="ph__title">{{ title }}</h1>
      <p v-if="desc" class="ph__desc">{{ desc }}</p>

      <slot name="meta" />
    </div>

    <div v-if="$slots.actions" class="ph__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  desc?: string
  /** 模块编号，如 01 */
  index?: string
  /** 等宽小标题，如 MODULES / USERS */
  kicker?: string
}>()
</script>

<style scoped lang="scss">
.ph {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding-bottom: 18px;
  margin-bottom: 20px;
  border-bottom: 1px solid $line;
}

.ph__main {
  min-width: 0;
}

.ph__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.ph__index {
  font-family: $font-mono;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: $primary;
  padding: 1px 6px;
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 4px;
  background: rgba(34, 211, 238, 0.08);
}

.ph__rule {
  width: clamp(24px, 8vw, 90px);
  height: 1px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.55), transparent);
}

.ph__title {
  margin: 0;
  font-size: clamp(1.35rem, 2.6vw, 1.85rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.25;
  color: $text;
}

.ph__desc {
  margin: 6px 0 0;
  max-width: 60ch;
  font-size: 0.86rem;
  color: $muted;
}

.ph__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 767px) {
  .ph {
    align-items: stretch;
    gap: 14px;
    margin-bottom: 16px;
  }

  .ph__actions {
    width: 100%;

    // 只让按钮在窄屏撑满，标签类元素保持原尺寸
    :deep(.el-button) {
      flex: 1 1 auto;
    }
  }
}
</style>

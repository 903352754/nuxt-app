<template>
  <footer class="ft">
    <div class="ft__inner">
      <div class="ft__left">
        <span class="ft__brand">XIAOHOME</span>
        <span class="ft__dot" aria-hidden="true">·</span>
        <span class="ft__item">© {{ year }}</span>
        <span class="ft__dot" aria-hidden="true">·</span>
        <span class="ft__item ft__stack">NUXT 4 / ELEMENT PLUS / MONGODB</span>
      </div>

      <div class="ft__right">
        <span class="status-dot" />
        <span class="ft__state">SYSTEM ONLINE</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped lang="scss">
.ft {
  position: relative;
  z-index: 1;
  margin-top: auto;
  border-top: 1px solid rgba(122, 190, 255, 0.09);
  background: linear-gradient(180deg, transparent, rgba(5, 7, 14, 0.7));
}

.ft__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding: 14px var(--app-gutter);
  font-size: 0.72rem;
  color: $faint;
}

.ft__left,
.ft__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ft__brand {
  font-family: $font-display;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  color: $muted;
}

.ft__dot {
  color: rgba(122, 190, 255, 0.3);
}

.ft__stack {
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.08em;
}

.ft__state {
  font-family: $font-mono;
  font-size: 0.64rem;
  letter-spacing: 0.16em;
  color: $ok;
}

@media (max-width: 640px) {
  .ft__inner {
    justify-content: center;
    text-align: center;
  }

  .ft__stack {
    display: none;
  }
}
</style>

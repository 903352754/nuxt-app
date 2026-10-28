<template>
  <div class="page-wrap about">
    <PageHeader
      index="03"
      kicker="MODULES / ABOUT"
      title="关于 XiaoHome"
      desc="一个面向内部工具的轻量控制台：用户数据、实时视频流与系统信息，统一入口、统一界面。"
    />

    <div class="about__grid">
      <!-- 规格表 -->
      <section class="panel tech-panel">
        <header class="panel__bar">
          <span class="tech-label">SPECIFICATION</span>
          <span class="tech-label">v1.0</span>
        </header>

        <dl class="spec">
          <div v-for="row in specs" :key="row.k" class="spec__row">
            <dt>{{ row.k }}</dt>
            <span class="spec__dots" aria-hidden="true" />
            <dd>{{ row.v }}</dd>
          </div>
        </dl>
      </section>

      <!-- 技术栈 -->
      <section class="panel tech-panel">
        <header class="panel__bar">
          <span class="tech-label">STACK</span>
          <span class="status-dot" />
        </header>

        <ul class="stack">
          <li v-for="(item, i) in stack" :key="item.name" class="stack__item">
            <span class="stack__idx">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="stack__name">{{ item.name }}</span>
            <span class="stack__tag">{{ item.tag }}</span>
          </li>
        </ul>
      </section>
    </div>

    <div class="about__actions">
      <el-button type="primary" @click="navigateTo('/users')">进入用户管理</el-button>
      <el-button @click="navigateTo('/')">返回总览</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: '关于',
  middleware: 'auth',
})

const specs = [
  { k: '框架', v: 'Nuxt 4 · Vue 3' },
  { k: 'UI 体系', v: 'Element Plus + Tailwind CSS' },
  { k: '视频', v: 'hls.js（HLS / m3u8）' },
  { k: '数据', v: 'MongoDB 5.9.2' },
  { k: '字体', v: 'Orbitron · JetBrains Mono' },
  { k: '部署', v: 'Nitro + pm2' },
]

const stack = [
  { name: 'Nuxt 4', tag: 'FRAMEWORK' },
  { name: 'Vue 3 <script setup>', tag: 'VIEW' },
  { name: 'Element Plus', tag: 'UI' },
  { name: 'Tailwind CSS v4', tag: 'CSS' },
  { name: 'hls.js', tag: 'MEDIA' },
  { name: 'MongoDB', tag: 'DB' },
]
</script>

<style scoped lang="scss">
.about__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: clamp(12px, 1.6vw, 20px);
}

.panel {
  overflow: hidden;
}

.panel__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid $line;
  background: rgba(122, 190, 255, 0.035);
}

/* 规格表：点线引导 */
.spec {
  margin: 0;
  padding: 6px 16px 14px;
}

.spec__row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(122, 190, 255, 0.07);

  &:last-child {
    border-bottom: 0;
  }

  dt {
    flex-shrink: 0;
    font-size: 0.82rem;
    color: $muted;
  }

  dd {
    margin: 0;
    font-family: $font-mono;
    font-size: 0.78rem;
    color: $text;
    text-align: right;
  }
}

.spec__dots {
  flex: 1;
  height: 1px;
  min-width: 12px;
  background-image: radial-gradient(rgba(122, 190, 255, 0.28) 1px, transparent 1px);
  background-size: 6px 1px;
  background-repeat: repeat-x;
}

/* 技术栈列表 */
.stack {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 8px;
  list-style: none;
}

.stack__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: rgba(34, 211, 238, 0.22);
    background: rgba(34, 211, 238, 0.06);
  }
}

.stack__idx {
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  color: $faint;
}

.stack__name {
  flex: 1;
  font-size: 0.86rem;
  color: $text-dim;
}

.stack__tag {
  font-family: $font-mono;
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  color: $primary;
  padding: 2px 7px;
  border: 1px solid rgba(34, 211, 238, 0.28);
  border-radius: 4px;
  background: rgba(34, 211, 238, 0.07);
}

.about__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: clamp(18px, 2.4vw, 28px);
}

@media (max-width: 480px) {
  .about__actions {
    flex-direction: column;

    :deep(.el-button + .el-button) {
      margin-left: 0;
    }
  }
}
</style>

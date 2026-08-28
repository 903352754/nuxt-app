<template>
  <section class="about">
    <div class="about__card">
      <div class="about__badge">
        <el-icon :size="24"><InfoFilled /></el-icon>
      </div>
      <h1 class="about__title">关于XiaoHome</h1>
      <p class="about__desc">
        XiaoHome是一个桌面式应用入口，聚合了用户管理、视频监控等常用能力。
        首页采用平板桌面风格，配合小清新背景与毛玻璃效果，多端自适应布局。
      </p>

      <ul class="about__list">
        <li>
          <span class="k">框架</span>
          <span class="v">Nuxt 4 + Vue 3</span>
        </li>
        <li>
          <span class="k">UI</span>
          <span class="v">Element Plus + Tailwind CSS</span>
        </li>
        <li>
          <span class="k">视频</span>
          <span class="v">hls.js 接入 HLS 实时流</span>
        </li>
        <li>
          <span class="k">数据</span>
          <span class="v">MongoDB</span>
        </li>
      </ul>

      <div class="about__actions">
        <el-button @click="navigateTo('/')">返回首页</el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { InfoFilled } from '@element-plus/icons-vue'

definePageMeta({
  middleware: 'auth',
})
</script>

<style scoped lang="scss">
.about {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: radial-gradient(50% -10%, #ecfdf5, transparent 60%),
    radial-gradient(100% 100%, #e0f2fe, transparent 60%),
    $bg;
}

.about__card {
  width: 100%;
  max-width: 640px;
  padding: 2.5rem 2rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
  text-align: center;
}

.about__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  color: #fff;
  background: linear-gradient(135deg, #c4b5fd, #8b5cf6);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.about__title {
  margin: 0 0 0.5rem;
  font-size: 1.6rem;
  font-weight: 800;
  color: $text;
}

.about__desc {
  margin: 0 auto 1.5rem;
  max-width: 36rem;
  color: $muted;
  line-height: 1.7;
}

.about__list {
  list-style: none;
  margin: 0 auto 1.75rem;
  padding: 0;
  max-width: 28rem;
  text-align: left;
  display: grid;
  gap: 0.5rem;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0.9rem;
    border-radius: 0.75rem;
    background: rgba(255, 255, 255, 0.55);
  }

  .k { color: $muted; font-size: 0.85rem; }
  .v { color: $text; font-weight: 600; }
}

.about__actions {
  display: flex;
  justify-content: center;
}
</style>

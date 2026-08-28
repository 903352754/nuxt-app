<template>
  <!-- 顶栏：宽度 100%，左标题 右头像，毛玻璃风格，多端自适应 -->
  <header
    class="app-header w-full border-b border-white/60 bg-white/55 backdrop-blur-md backdrop-saturate-150 shadow-sm"
  >
    <div
      class="app-header__inner mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
    >
      <!-- 左：标题 -->
      <NuxtLink to="/" class="app-header__brand flex items-center gap-2.5">
        <span class="app-header__logo" aria-hidden="true">
          <el-icon :size="22"><HomeFilled /></el-icon>
        </span>
        <span class="app-header__title text-lg font-bold tracking-wide sm:text-xl">XiaoHome</span>
      </NuxtLink>

      <!-- 右：头像 -->
      <div class="app-header__right">
        <el-dropdown trigger="click" @command="onCommand">
          <button class="avatar" type="button" aria-label="用户菜单">
            <span class="avatar__text">Xiao</span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="home">返回首页</el-dropdown-item>
              <el-dropdown-item command="about">关于</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { HomeFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
/* 结构与响应式由 Tailwind 工具类负责，这里仅保留视觉细节 */
.app-header {
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.04);
}

.app-header__brand {
  color: $text;
  text-decoration: none;
}

.app-header__title {
  white-space: nowrap;
  color: $text;
}

.app-header__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  color: #fff;
  background: linear-gradient(135deg, #6ee7b7, #38bdf8);
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.35);
}

/* 头像 */
.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.45);
}

.avatar__text {
  font-size: 1rem;
}
</style>

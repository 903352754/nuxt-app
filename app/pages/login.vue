<template>
  <div class="page-wrap login">
    <section class="card tech-panel tech-corners">
      <div class="card__head">
        <span class="card__mark" aria-hidden="true">
          <el-icon :size="20"><Lock /></el-icon>
        </span>
        <p class="tech-label">AUTHENTICATION</p>
        <h1 class="card__title">身份验证</h1>
        <p class="card__desc">演示环境：填写任意账号密码即可进入控制台。</p>
      </div>

      <el-form label-position="top" class="card__form" @submit.prevent="submit">
        <el-form-item label="账号">
          <el-input v-model="account" placeholder="admin" :prefix-icon="User" autocomplete="username" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="password"
            type="password"
            placeholder="••••••••"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
            @keyup.enter="submit"
          />
        </el-form-item>

        <el-button type="primary" native-type="submit" class="card__submit" :loading="loading">
          进入系统
        </el-button>
      </el-form>

      <p class="card__foot">
        <span class="tech-label">NOTICE</span>
        <span>尚未接入真实鉴权，仅作界面演示。</span>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Lock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

definePageMeta({
  title: '登录',
})

const account = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  if (!account.value.trim() || !password.value) {
    ElMessage.warning('请填写账号和密码')
    return
  }

  loading.value = true
  // 演示用：不做真实校验，短暂延时后直接进入
  await new Promise((r) => setTimeout(r, 400))
  loading.value = false

  ElMessage.success('已进入演示控制台')
  await navigateTo('/')
}
</script>

<style scoped lang="scss">
.login {
  display: grid;
  place-items: center;
  min-height: calc(100dvh - var(--app-header-height) - var(--app-breadcrumb-height) - 72px);
}

.card {
  width: 100%;
  max-width: 400px;
  padding: clamp(22px, 3vw, 32px);
}

.card__head {
  text-align: center;
  margin-bottom: 20px;
}

.card__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  border: 1px solid rgba(34, 211, 238, 0.38);
  border-radius: 12px;
  color: $primary;
  background: linear-gradient(150deg, rgba(34, 211, 238, 0.18), rgba(99, 102, 241, 0.12));
  box-shadow: 0 0 24px rgba(34, 211, 238, 0.18);
}

.card__title {
  margin: 8px 0 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: $text;
}

.card__desc {
  margin: 6px 0 0;
  font-size: 0.82rem;
  color: $muted;
}

.card__form {
  :deep(.el-form-item__label) {
    font-family: $font-mono;
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $muted;
  }
}

.card__submit {
  width: 100%;
  margin-top: 6px;
  height: 40px;
}

.card__foot {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 18px 0 0;
  padding-top: 14px;
  border-top: 1px solid $line;
  font-size: 0.72rem;
  color: $faint;
}

@media (max-width: 480px) {
  .login {
    min-height: auto;
    padding-top: 24px;
    padding-bottom: 32px;
  }
}
</style>

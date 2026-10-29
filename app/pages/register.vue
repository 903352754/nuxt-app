<template>
  <div class="reg">
    <section class="reg__card tech-panel tech-corners">
      <header class="reg__head">
        <span class="reg__kicker">
          <span class="reg__kickerDot" aria-hidden="true" />
          SIGN UP
        </span>
        <h1 class="reg__title">创建账号</h1>
        <p class="reg__desc">注册后即可登录 XiaoHome 控制台，账号会写入 MongoDB。</p>
      </header>

      <el-form class="reg__form" label-position="top" @submit.prevent="submit">
        <el-form-item label="用户名">
          <el-input
            ref="nameEl"
            v-model="name"
            size="large"
            placeholder="2–32 个字符，登录时可用"
            :prefix-icon="User"
            autocomplete="username"
            aria-label="用户名"
          />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input
            v-model="email"
            size="large"
            placeholder="you@example.com"
            :prefix-icon="Message"
            autocomplete="email"
            aria-label="邮箱"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="password"
            size="large"
            type="password"
            placeholder="至少 8 位"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
            aria-label="密码"
          />
        </el-form-item>

        <el-form-item label="确认密码">
          <el-input
            v-model="confirm"
            size="large"
            type="password"
            placeholder="再输入一次密码"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
            aria-label="确认密码"
            @keyup.enter="submit"
          />
        </el-form-item>

        <el-button
          class="reg__submit"
          type="primary"
          size="large"
          native-type="submit"
          :loading="loading"
        >
          {{ loading ? '正在创建…' : '创建并登录' }}
          <el-icon v-if="!loading" class="reg__submitIcon" :size="16">
            <Right />
          </el-icon>
        </el-button>
      </el-form>

      <p v-if="errorText" class="reg__error" role="alert">
        <el-icon :size="14"><WarningFilled /></el-icon>
        <span>{{ errorText }}</span>
      </p>

      <p class="reg__tip">
        <el-icon :size="14"><InfoFilled /></el-icon>
        <span>密码使用 scrypt 加盐哈希后入库，服务端不保存明文。</span>
      </p>

      <p class="reg__alt">
        <span>已有账号？</span>
        <NuxtLink :to="loginLink">去登录</NuxtLink>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  InfoFilled,
  Lock,
  Message,
  Right,
  User,
  WarningFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  AUTH_NAME_MAX,
  AUTH_NAME_MIN,
  AUTH_PASSWORD_MIN,
} from '#shared/auth'

definePageMeta({
  layout: 'auth',
  title: '注册',
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const route = useRoute()
const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorText = ref('')
const nameEl = ref<{ focus: () => void } | null>(null)

onMounted(() => {
  nameEl.value?.focus()
})

// 登录 / 注册之间互相跳转时保留 redirect
const redirectQuery = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' ? { redirect: target } : {}
})

const loginLink = computed(() => ({ path: '/login', query: redirectQuery.value }))

const redirectTo = computed(() => {
  const target = route.query.redirect
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) return '/'
  return target
})

watch([name, email, password, confirm], () => {
  if (errorText.value) errorText.value = ''
})

function validate() {
  const account = name.value.trim()
  if (!account) return '请输入用户名'
  if (account.length < AUTH_NAME_MIN || account.length > AUTH_NAME_MAX) {
    return `用户名需为 ${AUTH_NAME_MIN}–${AUTH_NAME_MAX} 个字符`
  }
  if (!EMAIL_RE.test(email.value.trim())) return '请输入有效的邮箱地址'
  if (password.value.length < AUTH_PASSWORD_MIN) return `密码至少 ${AUTH_PASSWORD_MIN} 位`
  if (password.value !== confirm.value) return '两次输入的密码不一致'
  return ''
}

async function submit() {
  if (loading.value) return

  const message = validate()
  if (message) {
    errorText.value = message
    return
  }

  errorText.value = ''
  loading.value = true

  try {
    const user = await register(name.value.trim(), email.value.trim(), password.value)
    ElMessage.success(`账号已创建，欢迎 ${user.name}`)
    await navigateTo(redirectTo.value)
  }
  catch (err) {
    const e = err as { data?: { message?: string }, statusCode?: number }
    errorText.value = e?.data?.message
      || (e?.statusCode === 429 ? '注册请求过于频繁，请稍后再试' : '注册失败，请检查网络后重试')
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.reg {
  width: 100%;
  display: flex;
  justify-content: center;
}

.reg__card {
  width: 100%;
  max-width: 440px;
  padding: clamp(24px, 3.4vw, 34px) clamp(22px, 3vw, 32px);
  animation: reg-in 0.5s $ease both;
}

@keyframes reg-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reg__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.reg__kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.2em;
  color: $primary;
}

.reg__kickerDot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: $primary;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.9);
}

.reg__title {
  margin: 0;
  font-size: clamp(1.32rem, 2.4vw, 1.55rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: $text;
}

.reg__desc {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.7;
  color: $muted;
}

.reg__form {
  display: flex;
  flex-direction: column;
  gap: 2px;

  :deep(.el-form-item) {
    margin-bottom: 15px;
  }

  :deep(.el-form-item__label) {
    font-family: $font-mono;
    font-size: 0.66rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: $muted;
    padding-bottom: 6px;
  }

  :deep(.el-input__wrapper) {
    padding: 2px 12px;
  }

  :deep(.el-input__inner) {
    height: 42px;
  }
}

.reg__submit {
  width: 100%;
  height: 44px;
  margin-top: 6px;
  font-size: 0.92rem;
  letter-spacing: 0.06em;
}

.reg__submitIcon {
  margin-left: 6px;
}

.reg__error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 14px 0 0;
  padding: 10px 12px;
  border: 1px solid rgba(248, 113, 113, 0.35);
  border-radius: $radius-sm;
  background: rgba(248, 113, 113, 0.08);
  font-size: 0.74rem;
  line-height: 1.6;
  color: $danger;

  .el-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }
}

.reg__tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 14px 0 0;
  padding: 10px 12px;
  border: 1px dashed rgba(122, 190, 255, 0.18);
  border-radius: $radius-sm;
  background: rgba(122, 190, 255, 0.04);
  font-size: 0.72rem;
  line-height: 1.6;
  color: $faint;

  .el-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: $muted;
  }
}

.reg__alt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px solid $line;
  font-size: 0.76rem;
  color: $muted;

  a {
    color: $primary;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: $primary-hover;
      text-decoration: underline;
    }
  }
}

@media (max-width: 480px) {
  .reg__card {
    padding: 22px 18px;
  }
}
</style>

<template>
  <div class="login">
    <div class="login__card tech-panel tech-corners">
      <!-- 左：说明面板 -->
      <aside class="login__aside">
        <div class="login__asideTop">
          <span class="tech-label">ACCESS CONTROL</span>
          <span class="login__badge">SECURE</span>
        </div>

        <div class="login__glyph">
          <el-icon :size="26"><Lock /></el-icon>
        </div>

        <h2 class="login__asideTitle">内部工具统一入口</h2>
        <p class="login__asideDesc">
          登录后可访问用户管理、实时监控与语音合成模块，
          桌面、平板、手机共用同一套界面。
        </p>

        <dl class="login__rows">
          <div class="login__row">
            <dt>账号来源</dt>
            <span class="login__dots" />
            <dd>MongoDB / users</dd>
          </div>
          <div class="login__row">
            <dt>当前会话</dt>
            <span class="login__dots" />
            <dd class="is-dim">未登录</dd>
          </div>
          <div class="login__row">
            <dt>控制台版本</dt>
            <span class="login__dots" />
            <dd>v1.0</dd>
          </div>
        </dl>

        <div class="login__asideFoot">
          <span class="status-dot" />
          <span class="tech-label">NODE / LOCAL</span>
        </div>
      </aside>

      <!-- 右：表单 -->
      <section class="login__panel">
        <header class="login__head">
          <span class="login__kicker">
            <span class="login__kickerDot" aria-hidden="true" />
            SIGN IN
          </span>
          <h1 class="login__title">登录控制台</h1>
          <p class="login__desc">输入账号与密码，进入 XiaoHome 管理界面。</p>
        </header>

        <el-form
          class="login__form"
          label-position="top"
          @submit.prevent="submit"
        >
          <el-form-item label="账号">
            <el-input
              ref="accountEl"
              v-model="account"
              size="large"
              placeholder="用户名或邮箱，例如 admin"
              :prefix-icon="User"
              autocomplete="username"
              aria-label="账号"
            />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="password"
              size="large"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              autocomplete="current-password"
              aria-label="密码"
              @keyup.enter="submit"
            />
          </el-form-item>

          <el-button
            class="login__submit"
            type="primary"
            size="large"
            native-type="submit"
            :loading="loading"
          >
            {{ loading ? '正在验证…' : '进入控制台' }}
            <el-icon v-if="!loading" class="login__submitIcon" :size="16">
              <Right />
            </el-icon>
          </el-button>
        </el-form>

        <p v-if="errorText" class="login__error" role="alert">
          <el-icon :size="14"><WarningFilled /></el-icon>
          <span>{{ errorText }}</span>
        </p>

        <p class="login__alt">
          <span>还没有账号？</span>
          <NuxtLink :to="registerLink">立即注册</NuxtLink>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, Right, User, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

definePageMeta({
  layout: 'auth',
  title: '登录',
})

const route = useRoute()
const { login } = useAuth()

const account = ref('')
const password = ref('')
const loading = ref(false)
const errorText = ref('')
const accountEl = ref<{ focus: () => void } | null>(null)

onMounted(() => {
  accountEl.value?.focus()
})

// 只接受站内路径，避免 ?redirect= 被用来跳外站
const redirectTo = computed(() => {
  const target = route.query.redirect
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) return '/'
  return target
})

const registerLink = computed(() => ({
  path: '/register',
  query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {},
}))

watch([account, password], () => {
  if (errorText.value) errorText.value = ''
})

async function submit() {
  if (loading.value) return

  if (!account.value.trim() || !password.value) {
    ElMessage.warning('请填写账号和密码')
    return
  }

  errorText.value = ''
  loading.value = true

  try {
    const user = await login(account.value.trim(), password.value)
    ElMessage.success(`欢迎回来，${user.name}`)
    await navigateTo(redirectTo.value)
  }
  catch (err) {
    const e = err as { data?: { message?: string }, statusCode?: number }
    errorText.value = e?.data?.message
      || (e?.statusCode === 429 ? '登录尝试过于频繁，请稍后再试' : '登录失败，请检查网络后重试')
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login {
  width: 100%;
  display: flex;
  justify-content: center;
}

.login__card {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1fr);
  width: 100%;
  max-width: 880px;
  overflow: hidden;
  animation: login-in 0.5s $ease both;
}

@keyframes login-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------------- 左侧说明 ---------------- */
.login__aside {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  padding: clamp(22px, 3vw, 32px);
  border-right: 1px solid $line;
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(34, 211, 238, 0.12), transparent 60%),
    radial-gradient(100% 90% at 100% 100%, rgba(99, 102, 241, 0.12), transparent 55%),
    linear-gradient(168deg, rgba(11, 20, 33, 0.6), rgba(6, 11, 19, 0.5));
}

/* 背景网格，让左侧不像一块纯色 */
.login__aside::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    linear-gradient(to right, rgba(122, 190, 255, 0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(122, 190, 255, 0.07) 1px, transparent 1px);
  background-size: 26px 26px;
  mask-image: radial-gradient(90% 80% at 20% 10%, #000, transparent 78%);
  -webkit-mask-image: radial-gradient(90% 80% at 20% 10%, #000, transparent 78%);
}

.login__aside > * {
  position: relative;
}

.login__asideTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.login__badge {
  padding: 1px 8px;
  border: 1px solid rgba(34, 211, 238, 0.4);
  border-radius: 999px;
  font-family: $font-mono;
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  color: $primary;
  background: rgba(34, 211, 238, 0.08);
}

.login__glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin-top: 6px;
  color: $primary;
  border: 1px solid rgba(34, 211, 238, 0.38);
  border-radius: 14px;
  background: linear-gradient(150deg, rgba(34, 211, 238, 0.18), rgba(99, 102, 241, 0.12));
  box-shadow: 0 0 26px rgba(34, 211, 238, 0.2), inset 0 0 14px rgba(34, 211, 238, 0.08);
}

.login__asideTitle {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: $text;
}

.login__asideDesc {
  margin: -6px 0 0;
  font-size: 0.8rem;
  line-height: 1.75;
  color: $muted;
}

/* 规格行：键 …… 值 */
.login__rows {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: auto 0 0;
  padding-top: 6px;
}

.login__row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: $font-mono;
  font-size: 0.7rem;
  color: $muted;

  dt {
    color: $faint;
    white-space: nowrap;
  }

  dd {
    margin: 0;
    color: $text-dim;
    white-space: nowrap;
  }

  dd.is-dim {
    color: $warn;
  }
}

.login__dots {
  flex: 1;
  min-width: 8px;
  height: 1px;
  background-image: linear-gradient(90deg, $line-strong 50%, transparent 50%);
  background-size: 6px 1px;
  opacity: 0.6;
}

.login__asideFoot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid $line;
}

/* ---------------- 右侧表单 ---------------- */
.login__panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  padding: clamp(24px, 3.4vw, 40px) clamp(22px, 3vw, 36px);
}

.login__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login__kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: $font-mono;
  font-size: 0.66rem;
  letter-spacing: 0.2em;
  color: $primary;
}

.login__kickerDot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: $primary;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.9);
}

.login__title {
  margin: 0;
  font-size: clamp(1.32rem, 2.4vw, 1.6rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: $text;
}

.login__desc {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.7;
  color: $muted;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 4px;

  :deep(.el-form-item) {
    margin-bottom: 16px;
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

.login__submit {
  width: 100%;
  height: 44px;
  margin-top: 4px;
  font-size: 0.92rem;
  letter-spacing: 0.06em;
}

.login__submitIcon {
  margin-left: 6px;
}

.login__error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
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

.login__alt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
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

/* ---------------- 断点 ---------------- */
@media (max-width: 768px) {
  .login__card {
    grid-template-columns: minmax(0, 1fr);
    max-width: 420px;
  }

  .login__aside {
    display: none;
  }
}

@media (max-width: 480px) {
  .login__panel {
    gap: 16px;
    padding: 22px 18px;
  }
}
</style>

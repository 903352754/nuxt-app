import type { AuthUser } from '#shared/auth'

/**
 * 登录态：user 为当前用户，resolved 表示是否已经向服务端确认过。
 * 状态放在 useState 里，SSR 结果会随 payload 一起下发，客户端不会重复请求。
 */
export function useAuth() {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const resolved = useState<boolean>('auth:resolved', () => false)

  // SSR 时需要把浏览器带来的 Cookie 一起转发给 /api/auth/me
  const requestFetch = import.meta.server ? useRequestFetch() : $fetch

  async function fetchUser(force = false) {
    if (resolved.value && !force) return user.value

    try {
      user.value = await requestFetch<AuthUser>('/api/auth/me')
    }
    catch {
      user.value = null
    }
    finally {
      resolved.value = true
    }

    return user.value
  }

  async function login(name: string, password: string) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { name, password },
    })
    user.value = data.user
    resolved.value = true
    return data.user
  }

  async function register(name: string, email: string, password: string) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    user.value = data.user
    resolved.value = true
    return data.user
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    finally {
      user.value = null
      resolved.value = true
    }
  }

  return { user, resolved, fetchUser, login, register, logout }
}

// =============================================================
// 登录态共享常量（app 与 server 共用）
// 会话凭证为 HS256 JWT，存放在 httpOnly Cookie 里，
// 浏览器 JS 读不到，只能由同源请求自动携带。
// =============================================================

export interface AuthUser {
  id: string
  name: string
  role: AuthRole
}

export type AuthRole = 'admin' | 'user'

/** 权限选项（页面下拉与校验共用） */
export const AUTH_ROLES = [
  { id: 'admin', label: '管理员' },
  { id: 'user', label: '普通用户' },
] as const

export const DEFAULT_AUTH_ROLE: AuthRole = 'user'

export function isAuthRole(value: unknown): value is AuthRole {
  return value === 'admin' || value === 'user'
}

/** 存放 JWT 的 Cookie 名 */
export const AUTH_COOKIE = 'xh_token'

/** 会话有效期（天） */
export const AUTH_MAX_AGE_DAYS = 7

/** 账号 / 密码长度限制 */
export const AUTH_NAME_MIN = 2
export const AUTH_NAME_MAX = 32
export const AUTH_PASSWORD_MIN = 8
export const AUTH_PASSWORD_MAX = 128

/** 邮箱长度上限 */
export const AUTH_EMAIL_MAX = 120

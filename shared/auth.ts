// =============================================================
// 登录态共享常量（app 与 server 共用）
// 会话凭证为 HS256 JWT，存放在 httpOnly Cookie 里，
// 浏览器 JS 读不到，只能由同源请求自动携带。
// =============================================================

export interface AuthUser {
  id: string
  name: string
}

/** 存放 JWT 的 Cookie 名 */
export const AUTH_COOKIE = 'xh_token'

/** 会话有效期（天） */
export const AUTH_MAX_AGE_DAYS = 7

/** 账号 / 密码长度上限（仅防御超大 payload，不限制具体内容） */
export const AUTH_NAME_MAX = 32
export const AUTH_PASSWORD_MAX = 128

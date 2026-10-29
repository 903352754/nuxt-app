// POST /api/auth/logout —— 退出登录，清除会话 Cookie
export default defineEventHandler((event) => {
  clearAuthCookie(event)
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true }
})

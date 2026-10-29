// =============================================================
// 全站鉴权中间件
// - 页面：未登录的 HTML 请求直接 302 到 /login（SSR 也不会闪一下内容）
// - API：/api/** 一律要求有效 JWT（登录 / 退出接口除外）
// - 已登录用户访问 /login 时交给 app 层中间件跳回首页
// =============================================================

const PUBLIC_PATHS = new Set([
  '/login',
  '/login/',
  '/register',
  '/register/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
])

export default defineEventHandler(async (event) => {
  const fullPath = event.path || '/'
  const path = fullPath.split('?')[0] || '/'

  if (PUBLIC_PATHS.has(path)) return

  // Nuxt 内部资源：/_nuxt/**、/_payload.json、/__nuxt_error 等
  if (path.startsWith('/_')) return

  const user = await getAuthUser(event)

  if (path.startsWith('/api/')) {
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: '请先登录',
      })
    }
    event.context.user = user
    return
  }

  // 只拦截页面文档请求；静态资源（图片 / 字体等）不受影响
  if (event.method !== 'GET' && event.method !== 'HEAD') return
  if (!(getHeader(event, 'accept') || '').includes('text/html')) return

  if (user) {
    event.context.user = user
    return
  }

  return sendRedirect(event, `/login?redirect=${encodeURIComponent(fullPath)}`, 302)
})

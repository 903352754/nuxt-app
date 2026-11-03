// =============================================================
// 全站鉴权中间件
// - 页面：未登录的 HTML 请求直接 302 到 /login（SSR 也不会闪一下内容）
// - API：/api/** 一律要求有效 JWT（登录 / 注册 / 退出接口除外）
// - /users 与 /api/users/** 额外要求「管理员」，且角色每次都从库里查，
//   改权限后立即生效（不用等 JWT 过期）
// - 已登录用户访问 /login、/register 时交给 app 层中间件跳回首页
// =============================================================
import { DEFAULT_AUTH_ROLE, isAuthRole } from '#shared/auth'
import { getUsersCollection, toUserId } from '../utils/db'

const PUBLIC_PATHS = new Set([
  '/login',
  '/login/',
  '/register',
  '/register/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
])

const ADMIN_PAGE_RE = /^\/users(\/|$)/
const ADMIN_API_RE = /^\/api\/users(\/|$)/

/** 从数据库读取最新角色；账号不存在返回 null */
async function resolveRole(userId: string) {
  try {
    const collection = await getUsersCollection()
    const doc = await collection.findOne(
      { _id: toUserId(userId) },
      { projection: { role: 1 } },
    )
    if (!doc) return null
    return isAuthRole(doc.role) ? doc.role : DEFAULT_AUTH_ROLE
  }
  catch (err) {
    console.error('[auth] 读取用户角色失败:', err)
    return null
  }
}

export default defineEventHandler(async (event) => {
  // 纯静态构建没有服务端，若仍做重定向，预渲染出来的每个页面都只会是
  // 跳往 /login 的空壳，因此静态模式下跳过鉴权
  if (useRuntimeConfig(event).public.staticMode) return

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

    if (ADMIN_API_RE.test(path) && (await resolveRole(user.id)) !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: '需要管理员权限',
      })
    }

    event.context.user = user
    return
  }

  // 只拦截页面文档请求；静态资源（图片 / 字体等）不受影响
  if (event.method !== 'GET' && event.method !== 'HEAD') return
  if (!(getHeader(event, 'accept') || '').includes('text/html')) return

  if (!user) {
    return sendRedirect(event, `/login?redirect=${encodeURIComponent(fullPath)}`, 302)
  }

  event.context.user = user

  if (ADMIN_PAGE_RE.test(path) && (await resolveRole(user.id)) !== 'admin') {
    // 非管理员不渲染用户管理页，直接回首页
    return sendRedirect(event, '/', 302)
  }
})

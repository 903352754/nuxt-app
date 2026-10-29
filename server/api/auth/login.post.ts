// =============================================================
// POST /api/auth/login —— 登录，签发 JWT 并写入 httpOnly Cookie
// 说明：当前没有用户库，任意非空账号 + 密码都可通过（演示用），
//      但会话本身是真实 JWT，受路由守卫与 API 中间件保护。
// =============================================================
import type { H3Event } from 'h3'
import { AUTH_NAME_MAX, AUTH_PASSWORD_MAX, type AuthUser } from '#shared/auth'

const RATE_WINDOW = 60_000
const RATE_LIMIT = 15
const attempts = new Map<string, number[]>()

function tooManyAttempts(event: H3Event) {
  // 取 XFF 最后一段（由最近的代理追加，前面的值客户端可以伪造）
  const chain = getHeader(event, 'x-forwarded-for')?.split(',').map(s => s.trim()).filter(Boolean)
  const ip = chain?.[chain.length - 1] || getRequestIP(event) || 'unknown'

  const now = Date.now()
  const recent = (attempts.get(ip) ?? []).filter(ts => now - ts < RATE_WINDOW)
  if (recent.length >= RATE_LIMIT) {
    attempts.set(ip, recent)
    setResponseHeader(event, 'retry-after', String(Math.ceil((RATE_WINDOW - (now - recent[0]!)) / 1000)))
    return true
  }
  recent.push(now)
  attempts.set(ip, recent)

  // 顺手清理过期 IP，避免 Map 无限增长
  if (attempts.size > 500) {
    for (const [key, list] of attempts) {
      if (!list.some(ts => now - ts < RATE_WINDOW)) attempts.delete(key)
    }
  }
  return false
}

export default defineEventHandler(async (event) => {
  if (tooManyAttempts(event)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: '登录尝试过于频繁，请一分钟后再试',
    })
  }

  const body = await readBody<{ name?: unknown; password?: unknown }>(event).catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!name || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '请填写账号和密码',
    })
  }
  if (name.length > AUTH_NAME_MAX) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: `账号最多 ${AUTH_NAME_MAX} 个字符`,
    })
  }
  if (password.length > AUTH_PASSWORD_MAX) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: `密码最多 ${AUTH_PASSWORD_MAX} 个字符`,
    })
  }

  // 暂无用户库：任意凭据都发一张 7 天有效的 JWT
  const user: AuthUser = { id: crypto.randomUUID(), name }
  const token = await signAuthToken(user)
  setAuthCookie(event, token)

  setResponseHeader(event, 'cache-control', 'no-store')
  return { user }
})

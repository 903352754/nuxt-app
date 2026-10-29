// =============================================================
// JWT 鉴权工具（Nitro 自动导入）
// - 签发 / 校验 HS256 JWT（jose）
// - 凭证只放 httpOnly Cookie，避免 XSS 直接读走
// =============================================================
import type { H3Event } from 'h3'
import { SignJWT, jwtVerify } from 'jose'
import { AUTH_COOKIE, AUTH_MAX_AGE_DAYS, DEFAULT_AUTH_ROLE, isAuthRole, type AuthUser } from '#shared/auth'

const TOKEN_TTL = `${AUTH_MAX_AGE_DAYS}d`
const COOKIE_MAX_AGE = AUTH_MAX_AGE_DAYS * 24 * 60 * 60

/** 仅开发环境使用的兜底密钥；生产环境必须配置 NUXT_JWT_SECRET */
const DEV_SECRET = 'xiaohome-dev-only-secret-do-not-use-in-production'

function getSecret(event?: H3Event) {
  const config = event ? useRuntimeConfig(event) : useRuntimeConfig()
  const secret = String(config.jwtSecret || '')
  if (secret) return new TextEncoder().encode(secret)

  if (import.meta.dev) return new TextEncoder().encode(DEV_SECRET)

  throw createError({
    statusCode: 500,
    statusMessage: 'JWT secret missing',
    message: '服务端未配置 NUXT_JWT_SECRET，无法签发登录凭证',
  })
}

/** 签发 7 天有效的 JWT */
export async function signAuthToken(user: AuthUser) {
  return new SignJWT({ name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret())
}

/** 校验 JWT，失败（过期 / 篡改 / 格式不对）一律返回 null */
export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    if (!payload.sub || typeof payload.name !== 'string' || !payload.name) return null
    return {
      id: payload.sub,
      name: payload.name,
      role: isAuthRole(payload.role) ? payload.role : DEFAULT_AUTH_ROLE,
    }
  }
  catch {
    return null
  }
}

/** 从请求 Cookie 里解析当前用户；未登录或凭证无效返回 null */
export async function getAuthUser(event: H3Event): Promise<AuthUser | null> {
  const token = getCookie(event, AUTH_COOKIE)
  if (!token) return null
  return verifyAuthToken(token)
}

/** 写会话 Cookie：httpOnly + SameSite=Lax，HTTPS 下自动加 Secure */
export function setAuthCookie(event: H3Event, token: string) {
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getRequestProtocol(event) === 'https',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

/** 清除会话 Cookie（退出登录） */
export function clearAuthCookie(event: H3Event) {
  setCookie(event, AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: getRequestProtocol(event) === 'https',
    path: '/',
    maxAge: 0,
  })
}

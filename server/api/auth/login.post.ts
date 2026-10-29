// =============================================================
// POST /api/auth/login —— 查 users 集合校验密码，签发 JWT
// 账号字段支持用户名或邮箱；密码用 scrypt 哈希比对。
// =============================================================
import {
  AUTH_EMAIL_MAX,
  AUTH_PASSWORD_MAX,
  type AuthUser,
} from '#shared/auth'
import { getUsersCollection } from '../../utils/db'

export default defineEventHandler(async (event) => {
  if (isRateLimited(event, 'login', 15)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: '登录尝试过于频繁，请一分钟后再试',
    })
  }

  const body = await readBody<{ name?: unknown; password?: unknown }>(event).catch(() => null)
  const account = typeof body?.name === 'string' ? body.name.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!account || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '请填写账号和密码',
    })
  }
  if (account.length > AUTH_EMAIL_MAX) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '账号或密码不正确',
    })
  }
  if (password.length > AUTH_PASSWORD_MAX) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '账号或密码不正确',
    })
  }

  let doc
  try {
    const collection = await getUsersCollection()
    doc = await collection.findOne({
      $or: [{ name: account }, { email: account.toLowerCase() }],
    })
  }
  catch (err) {
    console.error('[auth] 查询账号失败:', err)
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: '数据库暂时不可用，请稍后再试',
    })
  }

  // 统一提示，避免暴露账号是否存在
  const matched = await verifyPassword(password, doc?.passwordHash)
  if (!doc || !matched) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '用户名或密码错误',
    })
  }

  const user: AuthUser = { id: doc._id!.toString(), name: doc.name }
  const token = await signAuthToken(user)
  setAuthCookie(event, token)

  // 记录最近登录时间，失败不影响登录
  try {
    const collection = await getUsersCollection()
    await collection.updateOne({ _id: doc._id }, { $set: { lastLoginAt: new Date() } })
  }
  catch {}

  setResponseHeader(event, 'cache-control', 'no-store')
  return { user }
})

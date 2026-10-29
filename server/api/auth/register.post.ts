// =============================================================
// POST /api/auth/register —— 注册账号，写入 users 集合
// 成功即登录（写 JWT Cookie），前端可直接进入控制台。
// =============================================================
import {
  AUTH_EMAIL_MAX,
  AUTH_NAME_MAX,
  AUTH_NAME_MIN,
  AUTH_PASSWORD_MAX,
  AUTH_PASSWORD_MIN,
  type AuthUser,
} from '#shared/auth'
import { getUsersCollection } from '../../utils/db'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  if (isRateLimited(event, 'register', 5)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: '注册请求过于频繁，请稍后再试',
    })
  }

  const body = await readBody<{ name?: unknown, email?: unknown, password?: unknown }>(event)
    .catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!name || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '请填写用户名、邮箱和密码',
    })
  }
  if (name.length < AUTH_NAME_MIN || name.length > AUTH_NAME_MAX) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: `用户名需为 ${AUTH_NAME_MIN}–${AUTH_NAME_MAX} 个字符`,
    })
  }
  if (email.length > AUTH_EMAIL_MAX || !EMAIL_RE.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '邮箱格式不正确',
    })
  }
  if (password.length < AUTH_PASSWORD_MIN || password.length > AUTH_PASSWORD_MAX) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: `密码需为 ${AUTH_PASSWORD_MIN}–${AUTH_PASSWORD_MAX} 个字符`,
    })
  }

  let collection: Awaited<ReturnType<typeof getUsersCollection>>
  try {
    collection = await getUsersCollection()
    const exists = await collection.findOne({
      $or: [{ name }, { email }],
    })
    if (exists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: '用户名或邮箱已被占用',
      })
    }
  }
  catch (err) {
    if ((err as { statusCode?: number })?.statusCode === 409) throw err
    console.error('[auth] 注册前查询失败:', err)
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: '数据库暂时不可用，请稍后再试',
    })
  }

  const passwordHash = await hashPassword(password)

  let insertedId
  try {
    const result = await collection.insertOne({
      name,
      email,
      age: 0,
      hobbies: [],
      passwordHash,
      createdAt: new Date(),
    })
    insertedId = result.insertedId
  }
  catch (err) {
    console.error('[auth] 写入账号失败:', err)
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: '注册失败，请稍后再试',
    })
  }

  const user: AuthUser = { id: insertedId.toString(), name }
  const token = await signAuthToken(user)
  setAuthCookie(event, token)

  setResponseHeader(event, 'cache-control', 'no-store')
  return { user }
})

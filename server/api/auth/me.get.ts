// GET /api/auth/me —— 返回当前登录用户（未登录 401）
// 角色以数据库为准：管理员改了权限后，这里会立刻返回新角色，
// 并顺手重签一次 JWT，前端拿到的就是最新身份。
import { DEFAULT_AUTH_ROLE, isAuthRole, type AuthUser } from '#shared/auth'
import { getUsersCollection, toUserId } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const auth = await getAuthUser(event)
  if (!auth) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '请先登录',
    })
  }

  let doc
  try {
    const collection = await getUsersCollection()
    doc = await collection.findOne({ _id: toUserId(auth.id) })
  }
  catch (err) {
    console.error('[auth] 读取当前用户失败:', err)
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: '数据库暂时不可用，请稍后再试',
    })
  }

  if (!doc) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '账号不存在或已被删除',
    })
  }

  const user: AuthUser = {
    id: String(doc._id),
    name: doc.name,
    role: isAuthRole(doc.role) ? doc.role : DEFAULT_AUTH_ROLE,
  }

  if (user.role !== auth.role || user.name !== auth.name) {
    setAuthCookie(event, await signAuthToken(user))
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  return user
})

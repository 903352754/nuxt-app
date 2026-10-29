// GET /api/auth/me —— 返回当前登录用户（未登录 401）
export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '请先登录',
    })
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  return user
})

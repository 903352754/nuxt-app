// =============================================================
// /api/users/:id —— 单个用户的读取 / 更新 / 删除 / 改权限
// 仅管理员可访问；额外的自我保护：
// - 不能修改自己的权限（避免把自己降级后失去入口）
// - 不能删除当前登录账号
// =============================================================
import { DEFAULT_AUTH_ROLE, isAuthRole, type AuthUser } from '#shared/auth'
import { getUsersCollection, toUserId } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const collection = await getUsersCollection()
  const id = getRouterParam(event, 'id')!
  const _id = toUserId(id)
  const current = event.context.user as AuthUser | undefined
  const isSelf = !!current && String(current.id) === String(id)

  // GET 请求 → 单个用户
  if (event.method === 'GET') {
    const d = await collection.findOne({ _id })
    if (!d) throw createError({ statusCode: 404, statusMessage: '用户不存在' })
    return {
      id: d._id!.toString(),
      name: d.name,
      email: d.email,
      age: d.age,
      hobbies: d.hobbies ?? [],
      role: isAuthRole(d.role) ? d.role : DEFAULT_AUTH_ROLE,
    }
  }

  // PATCH 请求 → 只改权限（列表里的快捷切换）
  if (event.method === 'PATCH') {
    const body = await readBody(event)
    if (!isAuthRole(body?.role)) {
      throw createError({ statusCode: 400, statusMessage: '无效的权限值' })
    }
    if (isSelf) {
      throw createError({ statusCode: 400, statusMessage: '不能修改自己的权限' })
    }

    const res = await collection.updateOne({ _id }, { $set: { role: body.role } })
    if (res.matchedCount === 0) {
      throw createError({ statusCode: 404, statusMessage: '用户不存在' })
    }
    return { id, role: body.role }
  }

  // PUT 请求 → 更新用户信息
  if (event.method === 'PUT') {
    const body = await readBody(event)
    const roleProvided = isAuthRole(body?.role)

    if (isSelf && roleProvided && body.role !== 'admin') {
      throw createError({ statusCode: 400, statusMessage: '不能修改自己的权限' })
    }

    const update: Record<string, unknown> = {
      name: String(body?.name ?? ''),
      email: String(body?.email ?? ''),
      age: Number(body?.age) || 0,
      hobbies: Array.isArray(body?.hobbies) ? body.hobbies.map(String) : [],
    }
    if (roleProvided) update.role = body.role

    await collection.updateOne({ _id }, { $set: update })
    return { id, ...update }
  }

  // DELETE 请求 → 删除用户
  if (event.method === 'DELETE') {
    if (isSelf) {
      throw createError({ statusCode: 400, statusMessage: '不能删除当前登录账号' })
    }

    const res = await collection.deleteOne({ _id })
    if (res.deletedCount === 0) {
      throw createError({ statusCode: 404, statusMessage: '用户不存在' })
    }
    return { success: true, id }
  }
})

import { getUsersCollection, toUserId } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const collection = await getUsersCollection()
  const id = getRouterParam(event, 'id')!
  const _id = toUserId(id)

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
    }
  }

  // PUT 请求 → 更新用户
  if (event.method === 'PUT') {
    const body = await readBody(event)
    const update = {
      name: String(body?.name ?? ''),
      email: String(body?.email ?? ''),
      age: Number(body?.age) || 0,
      hobbies: Array.isArray(body?.hobbies) ? body.hobbies.map(String) : [],
    }
    await collection.updateOne({ _id }, { $set: update })
    return { id, ...update }
  }

  // DELETE 请求 → 删除用户
  if (event.method === 'DELETE') {
    const res = await collection.deleteOne({ _id })
    if (res.deletedCount === 0) throw createError({ statusCode: 404, statusMessage: '用户不存在' })
    return { success: true, id }
  }
})

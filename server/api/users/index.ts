// =============================================================
// /api/users —— 用户列表 / 新增（仅管理员，权限由 server/middleware/auth.ts 校验）
// =============================================================
import { DEFAULT_AUTH_ROLE, isAuthRole } from '#shared/auth'
import { getUsersCollection } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const collection = await getUsersCollection()

  // GET 请求 → 用户列表
  if (event.method === 'GET') {
    const docs = await collection.find({}, {
      projection: { name: 1, email: 1, age: 1, hobbies: 1, role: 1 },
    }).sort({ _id: 1 }).toArray()

    return docs.map(d => ({
      id: d._id!.toString(),
      name: d.name,
      email: d.email,
      age: d.age,
      hobbies: d.hobbies ?? [],
      role: isAuthRole(d.role) ? d.role : DEFAULT_AUTH_ROLE,
    }))
  }

  // POST 请求 → 新增用户（默认普通用户，可在弹窗里直接指定）
  if (event.method === 'POST') {
    const body = await readBody(event)
    const doc = {
      name: String(body?.name ?? ''),
      email: String(body?.email ?? ''),
      age: Number(body?.age) || 0,
      hobbies: Array.isArray(body?.hobbies) ? body.hobbies.map(String) : [],
      role: isAuthRole(body?.role) ? body.role : DEFAULT_AUTH_ROLE,
    }
    const result = await collection.insertOne(doc)
    return { id: result.insertedId.toString(), ...doc }
  }
})

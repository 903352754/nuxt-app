import { getUsersCollection } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const collection = await getUsersCollection()
  console.log(useRuntimeConfig(),'ccc')
  // GET 请求 → 用户列表
  if (event.method === 'GET') {
    const docs = await collection.find({}, {
      projection: { name: 1, email: 1, age: 1, hobbies: 1 },
    }).sort({ _id: 1 }).toArray()
    return docs.map(d => ({
      id: d._id!.toString(),
      name: d.name,
      email: d.email,
      age: d.age,
      hobbies: d.hobbies ?? [],
    }))
  }

  // POST 请求 → 新增用户
  if (event.method === 'POST') {
    const body = await readBody(event)
    const doc = {
      name: String(body?.name ?? ''),
      email: String(body?.email ?? ''),
      age: Number(body?.age) || 0,
      hobbies: Array.isArray(body?.hobbies) ? body.hobbies.map(String) : [],
    }
    const result = await collection.insertOne(doc)
    return { id: result.insertedId.toString(), ...doc }
  }
})

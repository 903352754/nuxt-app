import { MongoClient, ObjectId } from 'mongodb'
import type { Collection } from 'mongodb'

// users 集合的文档结构
export interface UserDoc {
  _id?: ObjectId
  name: string
  email: string
  age: number
  hobbies: string[]
}

const globalAny = globalThis as any

// 获取 users 集合（连接通过 globalThis 单例缓存，避免 dev HMR 反复重连）
export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri
  if (!uri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MONGODB_URI 未配置，请在 .env 中设置后重启',
    })
  }

  // 没有连接就创建连接
  if (!globalAny._mongoClient) {
    const client = new MongoClient(uri)
    globalAny._mongoClient = client
    await client.connect()
  }
  // 固定使用 db1 库
  const db = globalAny._mongoClient.db('db1')
  return db.collection('users') as Collection<UserDoc>
}

// id 字符串 → ObjectId，非法则抛 400
export function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效的 id' })
  }
  return new ObjectId(id)
}

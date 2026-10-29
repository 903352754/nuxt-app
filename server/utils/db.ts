import { MongoClient, ObjectId } from 'mongodb'
import type { Collection } from 'mongodb'

// users 集合的文档结构
export interface UserDoc {
  _id?: ObjectId
  name: string
  email: string
  age: number
  hobbies: string[]
  /** 登录密码哈希（scrypt$salt$hash）；通过 /register 或直接写库创建 */
  passwordHash?: string
  createdAt?: Date
  lastLoginAt?: Date
}

const globalAny = globalThis as any

// 建连并 ping 一次，成功后才算可用；失败时关闭 client，避免留下半死的连接
async function createClient(uri: string): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000, // 默认 30s，开发时等太久
  })
  try {
    await client.connect()
    await client.db('db1').command({ ping: 1 })
    return client
  } catch (err) {
    await client.close().catch(() => {})
    throw err
  }
}

// 获取 MongoClient（globalThis 缓存 Promise，避免 dev HMR 反复重连 + 并发重复建连）
export function getMongoClient(): Promise<MongoClient> {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri
  if (!uri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MONGODB_URI 未配置，请在 .env 中设置后重启',
    })
  }

  if (!globalAny._mongoClientPromise) {
    const pending = createClient(uri)
    globalAny._mongoClientPromise = pending
    // 建连失败必须清缓存，否则后续所有请求都只会拿到已关闭的 topology
    pending.catch(() => {
      if (globalAny._mongoClientPromise === pending) {
        globalAny._mongoClientPromise = undefined
      }
    })
  }
  return globalAny._mongoClientPromise
}

// 获取 users 集合
export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const client = await getMongoClient()
  // 固定使用 db1 库
  return client.db('db1').collection('users') as Collection<UserDoc>
}

// 路由参数 → Mongo 查询用的 _id 条件
// 兼容三种主键形态：ObjectId、数字主键（1）、字符串主键（"1"）
export function toUserId(id: string): any {
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '缺少 id' })
  }

  // 同一份数据里可能混用不同类型的 _id，用 $in 一次匹配所有可能形态
  const candidates: (string | number | ObjectId)[] = [id]
  if (/^\d+$/.test(id)) candidates.push(Number(id))
  if (/^[0-9a-f]{24}$/i.test(id)) candidates.push(new ObjectId(id))

  return candidates.length === 1 ? candidates[0] : { $in: candidates }
}

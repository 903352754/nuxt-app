// server/utils/mongodb.ts
import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

export function useMongo() {
    if (!client) {
        const uri = process.env.NUXT_MONGODB_URI!
        client = new MongoClient(uri)
        // 注意：不要在这里 await connect()，让驱动按需连接
    }
    return client.db('db1')
}
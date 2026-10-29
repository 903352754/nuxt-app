// =============================================================
// 修改账号权限：node scripts/set-role.mjs <用户名或邮箱> <admin|user>
//
// 注册账号默认是普通用户，第一个管理员用这个脚本提升：
//   npm run set-role -- zyh admin
// =============================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoClient } from 'mongodb'

const ROLES = ['admin', 'user']

const [account, role] = process.argv.slice(2)

if (!account || !role || !ROLES.includes(role)) {
  console.error('用法: node scripts/set-role.mjs <用户名或邮箱> <admin|user>')
  process.exit(1)
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** 与 ecosystem.config.cjs 一致：解析 .env（支持 KEY = 'value' 写法） */
function readEnv(file) {
  if (!fs.existsSync(file)) return {}
  const env = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if (
      (value.startsWith('\'') && value.endsWith('\''))
      || (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1)
    }
    env[match[1]] = value
  }
  return env
}

const env = readEnv(path.join(root, '.env'))
const uri = process.env.NUXT_MONGODB_URI || env.NUXT_MONGODB_URI

if (!uri) {
  console.error('未找到 NUXT_MONGODB_URI：请在项目根目录 .env 中配置')
  process.exit(1)
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 })

try {
  await client.connect()
  const users = client.db('db1').collection('users')

  const doc = await users.findOne({
    $or: [{ name: account }, { email: account.toLowerCase() }],
  })

  if (!doc) {
    console.error(`未找到账号：${account}`)
    process.exitCode = 1
  }
  else if (!doc.passwordHash) {
    console.error(`账号「${doc.name}」没有密码，无法登录，先让它通过注册页注册`)
    process.exitCode = 1
  }
  else {
    await users.updateOne({ _id: doc._id }, { $set: { role } })
    console.log(`已把「${doc.name}」(${doc.email}) 的权限设为 ${role}`)
  }
}
catch (err) {
  console.error('操作失败:', err.message)
  process.exitCode = 1
}
finally {
  await client.close()
}

const fs = require('node:fs')
const path = require('node:path')

// 读取项目根目录的 .env（该文件已被 .gitignore 忽略，不随仓库分发）。
// 自行解析而不用 process.loadEnvFile：后者对 `KEY = 'value'`（等号两侧有空格且值带引号）会解析失败。
// 已存在的 shell 环境变量优先，不会被 .env 覆盖。
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/)
    if (!m) continue
    let value = m[2].trim()
    const quoted =
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    if (quoted) value = value.slice(1, -1)
    if (process.env[m[1]] === undefined) process.env[m[1]] = value
  }
}

loadEnvFile(path.join(__dirname, '.env'))

const mongodbUri = process.env.NUXT_MONGODB_URI

if (!mongodbUri) {
  console.error(
    '[pm2] 未找到 NUXT_MONGODB_URI：请在项目根目录的 .env 中配置，或通过 shell 环境变量传入',
  )
}

module.exports = {
  apps: [
    {
      name: 'nuxt-demo',
      script: '.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        // 监听端口：与 Nginx 反代保持一致，默认 3000
        PORT: process.env.PORT || 3000,
        // 默认监听所有网卡，方便先用 IP:3000 直接验证；
        // 挂好 Nginx 后可改成 '127.0.0.1'，避免绕过反代直连
        HOST: process.env.HOST || '0.0.0.0',
        // 连接串不再硬编码，避免账号密码进入 git 历史
        ...(mongodbUri ? { NUXT_MONGODB_URI: mongodbUri } : {}),
      },
    },
  ],
}

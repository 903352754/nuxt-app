# Nuxt App

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## 模块

| 路由 | 说明 |
| --- | --- |
| `/login` | 登录：签发 7 天有效的 JWT 会话（演示：任意非空账号密码） |
| `/` | 总览：系统信息终端、功能入口 |
| `/users` | 用户管理：增删改查、分页、移动端卡片视图 |
| `/monitor` | 监控：HLS（m3u8）多路视频流 |
| `/tts` | 语音合成：MiMo-V2.5-TTS，9 种预置音色，mp3 / wav 试听与下载 |
| `/about` | 关于：技术栈与运行环境 |

语音合成通过 `POST /api/tts` 代理调用小米 MiMo 接口，API Key 只存在服务端
（`NUXT_MIMO_API_KEY`），不会下发到浏览器；接口内置每 IP 每分钟 6 次的限流。

## 登录与鉴权

- 会话是 HS256 JWT，存放在 **httpOnly** Cookie `xh_token` 里（7 天有效，HTTPS 下自动加 `Secure`），
  浏览器 JS 读不到，前端只通过 `GET /api/auth/me` 拿当前用户。
- 未登录访问任意页面：服务端直接 302 到 `/login?redirect=<原路径>`，登录成功后跳回原路径；
  客户端路由切换由 `app/middleware/auth.global.ts` 兜底。
- 所有 `/api/**`（`/api/auth/login`、`/api/auth/logout` 除外）都要求有效 JWT，未登录返回 401。
- 当前**没有用户库**：任意非空账号 + 密码都会通过，然后由服务端签发会话（仅演示）。
- 生产环境必须在 `.env` 配置 `NUXT_JWT_SECRET`（`openssl rand -hex 32`），
  缺失时登录接口返回 500；开发环境有内置兜底密钥。
- 登录接口按 IP 限流：每分钟 15 次，超出返回 429 + `retry-after`。

## 部署（PM2 + Node）

构建产物 `.output` 是自包含的（依赖已内联到 `.output/server/node_modules`），
服务器上**不需要** `npm install`，只需要这三样东西放在同一层级：

```
nuxt-app/
├── .output/              # 构建产物
├── ecosystem.config.cjs  # PM2 配置
└── .env                  # NUXT_MONGODB_URI、NUXT_MIMO_API_KEY、NUXT_JWT_SECRET（chmod 600，切勿提交）
```

```bash
# 1. 本机构建
npm run build

# 2. 上传（.env 单独传，或用服务器上已有的）
scp -r .output ecosystem.config.cjs user@server:/opt/xiaohome/
scp .env user@server:/opt/xiaohome/ && ssh user@server 'chmod 600 /opt/xiaohome/.env'

# 3. 启动
cd /opt/xiaohome
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup     # 开机自启，按提示复制执行输出的命令
```

要点：

- **Node ≥ 20**（本项目在 Node 24 上构建/验证）
- 连接串由 `ecosystem.config.cjs` 从 `.env` 读取并注入；shell 里已存在的
  `NUXT_MONGODB_URI` 优先级更高，可用于临时覆盖
- 运行时注入优先于构建时值：构建机器上没有数据库凭据也能部署
- `PORT` / `HOST` 可在 `.env` 或 shell 中覆盖，默认 `3000` / `0.0.0.0`
- **只用单实例**（不要 `-i max`）：应用用进程内缓存持有 Mongo 连接池
- MongoDB Atlas 的 Network Access 必须放行服务器出口 IP
- 不要用 `npm run generate`，本项目有服务端 API（`/api/**`）
- `ecosystem.config.cjs` 与 `.env` 都含凭据，不要公开存放

在线免费 mongodb 数据库: https://www.mongodb.com/zh-cn/products/platform

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

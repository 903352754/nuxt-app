# Nuxt App

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## 注意事项

```bash
部署在服务器 只需要 ecosystem.config.cjs文件 和 .output目录 在同一层级，
使用pm2管理器运行 pm2 start ecosystem.config.cjs 即可,
原则上来说 ecosystem.config.cjs文件 不可公开存放，
内部有mongodb的uri可直接连接数据库,
且此项目mongodb依赖版本锁定5.9.2,其他版本打包后会出现兼容性问题导致无法连接数据库

在线免费mongodb数据库:https://www.mongodb.com/zh-cn/products/platform
```

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

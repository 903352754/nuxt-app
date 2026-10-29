// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  $production:{
    routeRules:{
      // 页面要按请求 Cookie 判定登录态，任何 ISR / 静态缓存都会把 A 用户的
      // 已登录页面发给 B 用户，因此生产环境统一关闭缓存
      '/**':{isr:false}
    }
  },
  runtimeConfig:{
    mongodbUri: process.env.NUXT_MONGODB_URI || '',
    // 语音合成（MiMo-V2.5-TTS）：仅服务端可见，不会下发到浏览器
    mimoApiKey: process.env.NUXT_MIMO_API_KEY || '',
    // 登录会话 JWT 签名密钥（HS256），生产环境必须配置，开发环境有兜底值
    jwtSecret: process.env.NUXT_JWT_SECRET || '',
    public:{
      base: '/api'
    }
  },
  app:{
    // 页面切换动效（样式见 assets/scss/main.scss）
    pageTransition:{ name:'page', mode:'out-in' },
    head:{
      title:'XiaoHome',
      // 深色主题：html 上挂 dark，Element Plus 深色变量才会生效
      htmlAttrs:{ lang:'zh-CN', class:'dark' },
      meta:[
        { charset:'utf-8' },
        { name:'viewport', content:'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name:'theme-color', content:'#05070e' },
        { name:'description', content:'XiaoHome - 科技风控制台' }
      ]
    }
  },
  nitro: {
    externals: {
      inline: ['mongodb']
    }
  },
  vite:{
    plugins:[tailwindcss()],
    vueJsx:{
      mergeProps:true,
    },
    css:{
      preprocessorMaxWorkers:true,
      preprocessorOptions:{
        scss:{
          additionalData: '@use "~/assets/scss/_colors.scss" as *;'
        }
      }
    }
  },
  css:[
    // 自托管字体（latin 子集，中文字符回落到系统字体）
    '@fontsource/orbitron/latin-500.css',
    '@fontsource/orbitron/latin-700.css',
    '@fontsource/jetbrains-mono/latin-400.css',
    '@fontsource/jetbrains-mono/latin-500.css',
    // Element Plus 深色变量
    'element-plus/theme-chalk/dark/css-vars.css',
    '~/assets/css/tailwind.css',
    '~/assets/css/main.css',
    'animate.css',
    '~/assets/scss/main.scss',
  ],
  modules: ['@element-plus/nuxt'],
  elementPlus: {
    // 按需导入样式（默认开启，设为 false 则全量引入）
    importStyle: 'sass',       // 'css' | 'sass' | false
    // 自定义主题变量（仅 importStyle: 'sass' 时生效）
    sassVariables: '@/assets/styles/element-vars.scss',
    // 禁用自动导入（如果你想手动控制）
    autoImport: true,
    // 需要额外全局注册的组件
    components: ['ElMessage', 'ElMessageBox', 'ElNotification'],
  },
})
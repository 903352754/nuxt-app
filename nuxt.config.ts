// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  $production:{
    routeRules:{
      '/**':{isr:true}
    }
  },
  runtimeConfig:{
    mongodbUri: process.env.NUXT_MONGODB_URI || '',
    public:{
      base: '/api'
    }
  },
  app:{
    head:{
      title:'nuxt-app'
    }
  },
  nitro: {
    externals: {
      inline: ['mongodb']
    }
  },
  vite:{
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
  css:['~/assets/css/main.css','animate.css','~/assets/scss/main.scss'],
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
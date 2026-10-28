export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    // nuxt.config 已经声明了默认描述；这里只兜底，避免覆盖页面级自定义描述
    const hasDescription = html.head.some((tag) => tag.includes('name="description"'))
    if (!hasDescription) {
      html.head.push('<meta name="description" content="XiaoHome - 科技风控制台"/>')
    }
  })
})

// 全局路由守卫：所有页面都要求登录，/login 除外（已登录则回首页）
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, resolved, fetchUser } = useAuth()

  if (!resolved.value) await fetchUser()

  const isPublicPage = to.path === '/login' || to.path === '/register'

  if (isPublicPage) {
    if (user.value) return navigateTo('/')
    return
  }

  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : {},
    })
  }
})

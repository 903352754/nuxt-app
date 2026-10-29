// 全局路由守卫：所有页面都要求登录，/login、/register 除外（已登录则回首页）
// /users 仅管理员可进，进入前强制刷新一次角色，改权限后立即生效
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

  if (to.path === '/users' || to.path.startsWith('/users/')) {
    const fresh = await fetchUser(true)
    if (!fresh || fresh.role !== 'admin') return navigateTo('/')
  }
})

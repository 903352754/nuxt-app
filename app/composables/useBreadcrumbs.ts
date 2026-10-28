export interface Crumb {
  label: string
  to: string
  current: boolean
}

/**
 * 面包屑：由路由 matched 记录里的 meta.title 自动生成。
 * 页面只需 definePageMeta({ title: '用户管理' }) 即可，无需维护面包屑数组。
 */
export function useBreadcrumbs() {
  const route = useRoute()

  return computed<Crumb[]>(() => {
    const items: Crumb[] = [{ label: '首页', to: '/', current: false }]
    const seen = new Set<string>(['/'])

    for (const record of route.matched) {
      const title = (record.meta as { title?: string })?.title
      if (!title || seen.has(record.path)) continue
      seen.add(record.path)
      items.push({ label: title, to: record.path, current: false })
    }

    // 首页自身没有子路由标题时补一个“总览”
    if (items.length === 1) {
      items.push({ label: '总览', to: route.path, current: false })
    }

    // 最后一项固定为当前页（不渲染成链接）
    const last = items[items.length - 1]!
    last.to = route.path
    last.current = true
    return items.map((item, i) => ({ ...item, current: i === items.length - 1 }))
  })
}

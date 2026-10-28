/**
 * 断点检测：SSR 时按桌面渲染，挂载后再同步真实宽度，
 * 避免服务端与客户端渲染不一致。
 */
export function useBreakpoint() {
  const width = ref(1920)
  let frame = 0

  function sync() {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      width.value = window.innerWidth
    })
  }

  onMounted(() => {
    width.value = window.innerWidth
    window.addEventListener('resize', sync, { passive: true })
    window.addEventListener('orientationchange', sync, { passive: true })
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', sync)
    window.removeEventListener('orientationchange', sync)
  })

  return {
    width: readonly(width),
    isMobile: computed(() => width.value < 768),
    isTablet: computed(() => width.value >= 768 && width.value < 1024),
    isDesktop: computed(() => width.value >= 1024),
    /** 当前所处的布局档位，用于界面上直观展示自适应效果 */
    label: computed(() => {
      if (width.value < 768) return 'MOBILE'
      if (width.value < 1024) return 'TABLET'
      return 'DESKTOP'
    }),
  }
}

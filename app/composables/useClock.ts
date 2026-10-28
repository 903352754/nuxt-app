/** 本地时钟：SSR 阶段为空字符串，挂载后每秒更新 */
export function useClock() {
  const time = ref('')
  let timer: ReturnType<typeof setInterval> | undefined

  function tick() {
    const now = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    time.value = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`
  }

  onMounted(() => {
    tick()
    timer = setInterval(tick, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return time
}

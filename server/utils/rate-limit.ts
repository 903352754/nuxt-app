// =============================================================
// 简易内存限流（按 IP + bucket 分桶）
// 单实例部署够用；多实例需要换成 Redis 之类的共享存储。
// =============================================================
import type { H3Event } from 'h3'

const hits = new Map<string, number[]>()

export function isRateLimited(
  event: H3Event,
  bucket: string,
  limit: number,
  windowMs = 60_000,
) {
  // 取 XFF 最后一段（由最近的代理追加，前面的值客户端可伪造）
  const chain = getHeader(event, 'x-forwarded-for')?.split(',').map(s => s.trim()).filter(Boolean)
  const ip = chain?.[chain.length - 1] || getRequestIP(event) || 'unknown'
  const key = `${bucket}:${ip}`
  const now = Date.now()

  const recent = (hits.get(key) ?? []).filter(ts => now - ts < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    setResponseHeader(
      event,
      'retry-after',
      String(Math.ceil((windowMs - (now - recent[0]!)) / 1000)),
    )
    return true
  }

  recent.push(now)
  hits.set(key, recent)

  // 顺手清理过期 key，避免 Map 无限增长
  if (hits.size > 1000) {
    for (const [entry, list] of hits) {
      if (!list.some(ts => now - ts < windowMs)) hits.delete(entry)
    }
  }

  return false
}

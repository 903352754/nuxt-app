// =============================================================
// 密码哈希（Node 内置 scrypt，无需额外依赖）
// 存储格式：scrypt$<salt hex>$<hash hex>
// scrypt 自带内存/CPU 成本，比 SHA 系列更适合存密码。
// =============================================================
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>

const KEY_LENGTH = 64
const SALT_LENGTH = 16

/** 生成可入库的密码哈希 */
export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH)
  const hash = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

/** 校验密码；格式不对 / 密码错误都返回 false */
export async function verifyPassword(password: string, stored: string | undefined | null) {
  if (!stored) return false

  const [scheme, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false

  const expected = Buffer.from(hashHex, 'hex')
  if (!expected.length) return false

  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

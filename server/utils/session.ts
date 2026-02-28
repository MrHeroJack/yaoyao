import crypto from 'crypto'

const DEFAULT_TTL_SECONDS = 30 * 60

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is required')
  }
  return secret
}

export function getSessionTtlSeconds() {
  const raw = Number(process.env.ADMIN_SESSION_TTL_SECONDS ?? DEFAULT_TTL_SECONDS)
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_TTL_SECONDS
  return Math.min(Math.floor(raw), 24 * 60 * 60)
}

function toBase64Url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url')
}

function fromBase64Url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8')
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + getSessionTtlSeconds() * 1000
  const payload = JSON.stringify({ role: 'admin', exp: expiresAt })
  const payloadEncoded = toBase64Url(payload)
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadEncoded)
    .digest('base64url')
  return `${payloadEncoded}.${signature}`
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false
  try {
    const [payloadEncoded, signature] = token.split('.')
    if (!payloadEncoded || !signature) return false

    const expected = crypto
      .createHmac('sha256', getSessionSecret())
      .update(payloadEncoded)
      .digest('base64url')

    const providedBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expected)
    if (providedBuffer.length !== expectedBuffer.length) return false
    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return false

    const payload = JSON.parse(fromBase64Url(payloadEncoded)) as { role?: string; exp?: number }
    return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now()
  } catch {
    return false
  }
}

export function parseCookieValue(header: string | undefined, key: string) {
  if (!header) return null
  const pairs = header.split(';').map((part) => part.trim())
  for (const pair of pairs) {
    const [cookieKey, ...rest] = pair.split('=')
    if (cookieKey === key) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return null
}

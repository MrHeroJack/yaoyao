import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { getQiniuUploadToken } from './utils/qiniu'
import { getOssPolicySignature } from './utils/oss'
import {
  createAdminSessionToken,
  getSessionTtlSeconds,
  parseCookieValue,
  verifyAdminSessionToken,
} from './utils/session'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

dotenv.config()

const app = express()
const SESSION_COOKIE_NAME = 'yaoyao_admin_session'
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173')
}
const allowOriginSet = new Set(allowedOrigins)

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowOriginSet.has(origin)) return callback(null, true)
    return callback(null, false)
  },
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))

function secureEquals(input: string, expected: string) {
  const inputBuffer = Buffer.from(input)
  const expectedBuffer = Buffer.from(expected)
  if (inputBuffer.length !== expectedBuffer.length) return false
  return crypto.timingSafeEqual(inputBuffer, expectedBuffer)
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.floor(parsed)))
}

function normalizeUploadDir(dir: unknown) {
  if (typeof dir !== 'string') return 'uploads/'
  const normalized = dir.trim().replace(/^\/+/, '')
  if (!normalized.startsWith('uploads/')) return 'uploads/'
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function setSessionCookie(res: express.Response, token: string, maxAgeSeconds: number) {
  const isProd = process.env.NODE_ENV === 'production'
  const cookie = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    isProd ? 'Secure' : null,
  ]
    .filter(Boolean)
    .join('; ')
  res.setHeader('Set-Cookie', cookie)
}

function clearSessionCookie(res: express.Response) {
  const isProd = process.env.NODE_ENV === 'production'
  const cookie = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    isProd ? 'Secure' : null,
  ]
    .filter(Boolean)
    .join('; ')
  res.setHeader('Set-Cookie', cookie)
}

function isAdminAuthenticated(req: express.Request) {
  const token = parseCookieValue(req.headers.cookie, SESSION_COOKIE_NAME)
  return verifyAdminSessionToken(token)
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return next()
}

app.post('/api/admin/login', (req, res) => {
  const configuredPassword = process.env.ADMIN_PASSWORD
  if (!configuredPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured' })
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!secureEquals(password, configuredPassword)) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  const ttlSeconds = getSessionTtlSeconds()
  try {
    setSessionCookie(res, createAdminSessionToken(), ttlSeconds)
  } catch {
    return res.status(500).json({ error: 'ADMIN_SESSION_SECRET is not configured' })
  }
  return res.json({ ok: true, expiresIn: ttlSeconds })
})

app.post('/api/admin/logout', (_req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

app.get('/api/admin/me', (req, res) => {
  res.json({ authenticated: isAdminAuthenticated(req) })
})

app.get('/api/storage/providers', (_req, res) => {
  const providers: Array<{ key: string; name: string; available: boolean }> = [
    { key: 'link-only', name: '链接模式', available: true },
    {
      key: 'qiniu',
      name: '七牛云',
      available: !!(
        process.env.QINIU_ACCESS_KEY &&
        process.env.QINIU_SECRET_KEY &&
        process.env.QINIU_BUCKET
      ),
    },
    {
      key: 'oss',
      name: '阿里云OSS',
      available: !!(
        process.env.ALI_ACCESS_KEY_ID &&
        process.env.ALI_ACCESS_KEY_SECRET &&
        process.env.ALI_OSS_BUCKET &&
        process.env.ALI_OSS_REGION
      ),
    },
  ]
  res.json({ providers })
})

app.post('/api/upload/qiniu/token', requireAdmin, async (req, res) => {
  try {
    const { key, expires = 3600 } = req.body || {}
    if (typeof key !== 'string' || !key.startsWith('uploads/')) {
      return res.status(400).json({ error: 'Invalid key' })
    }
    if (!process.env.QINIU_ACCESS_KEY || !process.env.QINIU_SECRET_KEY || !process.env.QINIU_BUCKET) {
      return res.status(400).json({ error: 'Qiniu environment not configured' })
    }
    const { uploadToken, scope } = getQiniuUploadToken({
      key,
      expires: clampNumber(expires, 60, 3600, 600),
      bucket: process.env.QINIU_BUCKET!,
      accessKey: process.env.QINIU_ACCESS_KEY!,
      secretKey: process.env.QINIU_SECRET_KEY!,
    })
    res.json({ uploadToken, scope })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Qiniu token' })
  }
})

app.post('/api/upload/oss/policy', requireAdmin, (req, res) => {
  try {
    const { dir = 'uploads/', expires = 60 } = req.body || {}
    if (!process.env.ALI_ACCESS_KEY_ID || !process.env.ALI_ACCESS_KEY_SECRET || !process.env.ALI_OSS_BUCKET || !process.env.ALI_OSS_REGION) {
      return res.status(400).json({ error: 'OSS environment not configured' })
    }
    const result = getOssPolicySignature({
      accessKeyId: process.env.ALI_ACCESS_KEY_ID!,
      accessKeySecret: process.env.ALI_ACCESS_KEY_SECRET!,
      bucket: process.env.ALI_OSS_BUCKET!,
      region: process.env.ALI_OSS_REGION!,
      dir: normalizeUploadDir(dir),
      expires: clampNumber(expires, 30, 600, 60),
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate OSS policy' })
  }
})

app.get('/api/images', requireAdmin, (_req, res) => {
  if (process.env.MOCK_UPLOAD === 'true') {
    return res.json({ items: [] })
  }
  res.status(501).json({ error: 'Listing images is not implemented yet' })
})

app.delete('/api/images/:key', requireAdmin, (_req, res) => {
  if (process.env.MOCK_UPLOAD === 'true') {
    return res.json({ ok: true })
  }
  res.status(501).json({ error: 'Deleting images is not implemented yet' })
})

const port = process.env.PORT || 3001
// 仅在直接运行时监听，导出 app 供 Vercel 使用
if (process.argv[1] === __filename) {
  app.listen(port, () => {
    console.log(`Storage sign server listening on :${port}`)
  })
}

export default app

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { getQiniuUploadToken } from './utils/qiniu.js'
import { getOssPolicySignature } from './utils/oss.js'
import {
  createAdminSessionToken,
  getSessionTtlSeconds,
  parseCookieValue,
  verifyAdminSessionToken,
} from './utils/session.js'

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

function normalizeBaseUrl(value: string | undefined) {
  return (value || '').trim().replace(/\/+$/, '')
}

function buildQiniuSourceBaseUrl() {
  return normalizeBaseUrl(process.env.QINIU_SOURCE_URL || process.env.QINIU_PUBLIC_URL)
}

function buildQiniuDeliveryBaseUrl() {
  const publicBaseUrl = normalizeBaseUrl(process.env.QINIU_PUBLIC_URL)
  if (!publicBaseUrl) return ''
  // HTTPS 页面无法安全加载 HTTP 资源，自动走服务端代理路径。
  if (publicBaseUrl.startsWith('http://')) return '/api/upload/qiniu/public'
  return publicBaseUrl
}

function encodeStorageKey(key: string) {
  return key
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
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

  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : ''
  const expectedPassword = configuredPassword.trim()
  if (!secureEquals(password, expectedPassword)) {
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
  const qiniuAccessKey = (process.env.QINIU_ACCESS_KEY || '').trim()
  const qiniuSecretKey = (process.env.QINIU_SECRET_KEY || '').trim()
  const qiniuBucket = (process.env.QINIU_BUCKET || '').trim()
  const ossAccessKeyId = (process.env.ALI_ACCESS_KEY_ID || '').trim()
  const ossAccessKeySecret = (process.env.ALI_ACCESS_KEY_SECRET || '').trim()
  const ossBucket = (process.env.ALI_OSS_BUCKET || '').trim()
  const ossRegion = (process.env.ALI_OSS_REGION || '').trim()
  const providers: Array<{ key: string; name: string; available: boolean }> = [
    { key: 'link-only', name: '链接模式', available: true },
    {
      key: 'qiniu',
      name: '七牛云',
      available: !!(qiniuAccessKey && qiniuSecretKey && qiniuBucket),
    },
    {
      key: 'oss',
      name: '阿里云OSS',
      available: !!(ossAccessKeyId && ossAccessKeySecret && ossBucket && ossRegion),
    },
  ]
  res.json({ providers })
})

app.post('/api/upload/qiniu/token', requireAdmin, async (req, res) => {
  try {
    const { key, expires = 3600 } = req.body || {}
    const accessKey = (process.env.QINIU_ACCESS_KEY || '').trim()
    const secretKey = (process.env.QINIU_SECRET_KEY || '').trim()
    const bucket = (process.env.QINIU_BUCKET || '').trim()
    if (typeof key !== 'string' || !key.startsWith('uploads/')) {
      return res.status(400).json({ error: 'Invalid key' })
    }
    if (!accessKey || !secretKey || !bucket) {
      return res.status(400).json({ error: 'Qiniu environment not configured' })
    }
    const { uploadToken, scope } = getQiniuUploadToken({
      key,
      expires: clampNumber(expires, 60, 3600, 600),
      bucket,
      accessKey,
      secretKey,
    })
    const region = (process.env.QINIU_REGION || 'z0').trim()
    const publicBaseUrl = buildQiniuDeliveryBaseUrl()
    res.json({ uploadToken, scope, region, publicBaseUrl })
  } catch (err) {
    console.error('Failed to generate Qiniu token:', err)
    res.status(500).json({ error: 'Failed to generate Qiniu token' })
  }
})

app.get(/^\/api\/upload\/qiniu\/public\/(.+)$/, async (req, res) => {
  try {
    const key = decodeURIComponent(req.params[0] || '').replace(/^\/+/, '')
    if (!key.startsWith('uploads/')) {
      return res.status(400).json({ error: 'Invalid key' })
    }

    const sourceBaseUrl = buildQiniuSourceBaseUrl()
    if (!sourceBaseUrl) {
      return res.status(500).json({ error: 'Qiniu public URL is not configured' })
    }

    const sourceUrl = `${sourceBaseUrl}/${encodeStorageKey(key)}`
    const upstream = await fetch(sourceUrl)
    if (!upstream.ok) {
      const upstreamBody = await upstream.text()
      return res.status(upstream.status).send(upstreamBody)
    }

    const headersToForward = ['content-type', 'cache-control', 'etag', 'last-modified'] as const
    for (const header of headersToForward) {
      const value = upstream.headers.get(header)
      if (value) res.setHeader(header, value)
    }

    const body = Buffer.from(await upstream.arrayBuffer())
    return res.status(200).send(body)
  } catch (err) {
    console.error('Failed to proxy Qiniu image:', err)
    return res.status(500).json({ error: 'Failed to fetch Qiniu image' })
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

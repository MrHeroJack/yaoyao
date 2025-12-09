import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { getQiniuUploadToken } from './utils/qiniu'
import { getOssPolicySignature } from './utils/oss'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

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

app.post('/api/upload/qiniu/token', async (req, res) => {
  try {
    const { key, expires = 3600, prefix = 'uploads/' } = req.body || {}
    if (!process.env.QINIU_ACCESS_KEY || !process.env.QINIU_SECRET_KEY || !process.env.QINIU_BUCKET) {
      return res.status(400).json({ error: 'Qiniu environment not configured' })
    }
    const { uploadToken, scope } = getQiniuUploadToken({
      key,
      expires,
      bucket: process.env.QINIU_BUCKET!,
      prefix,
      accessKey: process.env.QINIU_ACCESS_KEY!,
      secretKey: process.env.QINIU_SECRET_KEY!,
    })
    res.json({ uploadToken, scope })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Qiniu token' })
  }
})

app.post('/api/upload/oss/policy', (req, res) => {
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
      dir,
      expires,
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate OSS policy' })
  }
})

app.get('/api/images', (_req, res) => {
  if (process.env.MOCK_UPLOAD === 'true') {
    return res.json({ items: [] })
  }
  res.status(501).json({ error: 'Listing images is not implemented yet' })
})

app.delete('/api/images/:key', (_req, res) => {
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



import qiniu from 'qiniu'

export function getQiniuUploadToken(opts: {
  accessKey: string
  secretKey: string
  bucket: string
  key: string
  expires?: number
}) {
  const accessKey = opts.accessKey.trim()
  const secretKey = opts.secretKey.trim()
  const bucket = opts.bucket.trim()
  const key = opts.key.trim()
  const scope = `${bucket}:${key}`
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
  const putPolicy = new qiniu.rs.PutPolicy({
    scope,
    expires: opts.expires ?? 3600,
    deleteAfterDays: 0,
  })
  const uploadToken = putPolicy.uploadToken(mac)
  return { uploadToken, scope }
}

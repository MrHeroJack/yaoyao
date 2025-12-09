import qiniu from 'qiniu'

export function getQiniuUploadToken(opts: {
  accessKey: string
  secretKey: string
  bucket: string
  key?: string
  prefix?: string
  expires?: number
}) {
  const mac = new qiniu.auth.digest.Mac(opts.accessKey, opts.secretKey)
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: opts.key ? `${opts.bucket}:${opts.key}` : opts.bucket,
    expires: opts.expires ?? 3600,
    deleteAfterDays: 0,
  })
  const uploadToken = putPolicy.uploadToken(mac)
  return { uploadToken, scope: putPolicy.options.scope }
}


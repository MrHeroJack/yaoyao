import qiniu from 'qiniu'

export function getQiniuUploadToken(opts: {
  accessKey: string
  secretKey: string
  bucket: string
  key: string
  expires?: number
}) {
  const mac = new qiniu.auth.digest.Mac(opts.accessKey, opts.secretKey)
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: `${opts.bucket}:${opts.key}`,
    expires: opts.expires ?? 3600,
    deleteAfterDays: 0,
  })
  const uploadToken = putPolicy.uploadToken(mac)
  return { uploadToken, scope: putPolicy.options.scope }
}

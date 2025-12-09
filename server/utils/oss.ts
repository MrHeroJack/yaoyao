import crypto from 'crypto'

export function getOssPolicySignature(opts: {
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  region: string
  dir: string
  expires: number
}) {
  const expiration = new Date(Date.now() + opts.expires * 1000).toISOString()
  const policy = {
    expiration,
    conditions: [
      ['starts-with', '$key', opts.dir],
      { bucket: opts.bucket },
      ['content-length-range', 0, 5 * 1024 * 1024],
    ],
  }
  const policyBase64 = Buffer.from(JSON.stringify(policy)).toString('base64')
  const signature = crypto
    .createHmac('sha1', opts.accessKeySecret)
    .update(policyBase64)
    .digest('base64')
  const host = `https://${opts.bucket}.${opts.region}.aliyuncs.com`
  return {
    accessKeyId: opts.accessKeyId,
    policy: policyBase64,
    signature,
    dir: opts.dir,
    host,
    expireAt: expiration,
  }
}


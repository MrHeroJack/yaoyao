# API 文档

## 列出提供者
GET `/api/storage/providers`
- 响应：`{ providers: [{ key, name, available }] }`

## 七牛云上传签名
POST `/api/upload/qiniu/token`
- 请求体：`{ key?: string, expires?: number, prefix?: string }`
- 响应：`{ uploadToken, scope }`

## 阿里云OSS表单策略
POST `/api/upload/oss/policy`
- 请求体：`{ dir?: string, expires?: number }`
- 响应：`{ accessKeyId, policy, signature, host, dir, expireAt }`

## 列举图片（演示）
GET `/api/images`
- 响应（Mock）：`{ items: [] }`

## 删除图片（演示）
DELETE `/api/images/:key`
- 响应（Mock）：`{ ok: true }`

## 安全与限制
- 所有密钥仅存在后端；前端仅获得短时令牌与策略
- OSS 表单策略限制目录前缀与大小（≤5MB）


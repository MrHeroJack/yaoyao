# API 文档

## 管理员登录
POST `/api/admin/login`
- 请求体：`{ password: string }`
- 响应：`{ ok: true, expiresIn: number }`

## 管理员登出
POST `/api/admin/logout`
- 响应：`{ ok: true }`

## 查询登录态
GET `/api/admin/me`
- 响应：`{ authenticated: boolean }`

## 列出提供者
GET `/api/storage/providers`
- 响应：`{ providers: [{ key, name, available }] }`

## 七牛云上传签名
POST `/api/upload/qiniu/token`
- 请求体：`{ key: string, expires?: number }`
- 响应：`{ uploadToken, scope, region, publicBaseUrl }`
- 鉴权：需要管理员登录态（HttpOnly Cookie）

## 阿里云OSS表单策略
POST `/api/upload/oss/policy`
- 请求体：`{ dir?: string, expires?: number }`
- 响应：`{ accessKeyId, policy, signature, host, dir, expireAt }`
- 鉴权：需要管理员登录态（HttpOnly Cookie）

## 列举图片（演示）
GET `/api/images`
- 响应（Mock）：`{ items: [] }`
- 鉴权：需要管理员登录态（HttpOnly Cookie）

## 删除图片（演示）
DELETE `/api/images/:key`
- 响应（Mock）：`{ ok: true }`
- 鉴权：需要管理员登录态（HttpOnly Cookie）

## 安全与限制
- 所有密钥仅存在后端；前端仅获得短时令牌与策略
- 上传签名接口通过管理员会话控制访问
- OSS 表单策略限制目录前缀与大小（≤5MB）

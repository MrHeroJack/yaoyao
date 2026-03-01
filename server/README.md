# 存储签名服务

用于前端安全集成七牛云/阿里云 OSS 上传的轻后端，提供上传所需的临时签名与策略，避免在前端暴露密钥。

## 运行

1. 复制 `.env.example` 为 `.env` 并填入对应云服务配置
2. 安装依赖并启动服务：

```
npm install
npx tsx server/index.ts
```

> 生产环境请使用 `pm2`/`docker` 部署，并仅在私有网络中持有密钥。

## API

- `POST /api/admin/login`：管理员登录，设置 HttpOnly 会话 Cookie
- `POST /api/admin/logout`：管理员登出，清除会话 Cookie
- `GET /api/admin/me`：查看当前会话是否已认证
- `GET /api/storage/providers`：返回可用的存储提供者
- `POST /api/upload/qiniu/token`：生成七牛云 `uploadToken`（返回 `region/publicBaseUrl`，需管理员会话）
- `POST /api/upload/oss/policy`：生成 OSS 表单直传 `policy` 与 `signature`（需管理员会话）
- `GET /api/images`：列举图片（需管理员会话，默认关闭，`MOCK_UPLOAD=true` 时返回空集合）
- `DELETE /api/images/:key`：删除图片（需管理员会话，默认关闭，`MOCK_UPLOAD=true` 时返回成功）

## 安全

- 任何密钥仅存在于后端环境变量；前端仅接收短时签名/策略
- 上传签名接口默认要求管理员登录态（会话 Cookie）
- 建议为管理员上传采用最短有效期与目录前缀限制

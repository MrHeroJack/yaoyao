# 我们的欢乐时光 | 家庭时间轴

一个用于记录家庭美好瞬间的时间轴网站，部署在 Vercel 平台。

## 🌟 项目特色

- 🎨 **温馨设计**：紫色到蓝色的渐变背景，营造温馨氛围
- 📱 **响应式布局**：适配各种设备屏幕
- ⚡ **快速加载**：基于 Vite 构建，优化性能
- 🚀 **现代技术栈**：React 19 + TypeScript + Tailwind CSS

## 🛠️ 技术栈

- **前端框架**：React 19
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **动画库**：Framer Motion
- **类型检查**：TypeScript
- **部署平台**：Vercel

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看项目。

### 构建项目

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📦 部署

项目已配置为自动部署到 Vercel：

1. 推送代码到 Git 仓库
2. 连接到 Vercel
3. 自动构建和部署

### 手动部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

## 🌐 在线访问

- **Vercel 部署地址**：[https://yaoyao-timeline-kzratajbh-mrherojacks-projects.vercel.app](https://yaoyao-timeline-kzratajbh-mrherojacks-projects.vercel.app)

## 📁 项目结构

```
yaoyao/
├── public/          # 静态资源
├── src/             # 源代码
│   ├── components/  # React 组件
│   ├── assets/      # 资源文件
│   └── ...
├── .vercel/         # Vercel 配置
├── package.json     # 项目配置
├── vite.config.ts   # Vite 配置
└── README.md        # 项目说明
```

## 🎯 功能特性

- ✅ 时间轴展示
- ✅ 响应式设计
- ✅ 现代化 UI
- ✅ 快速部署
- ✅ 性能优化
- ✅ 管理员会话鉴权（上传签名接口受保护）
- ✅ 事件本地持久化（LocalStorage）
- ✅ 事件 JSON 导入/导出（管理员工具）
- ✅ 按需加载上传 Provider 与非首屏模块

## 📝 开发说明

- 使用 TypeScript 进行类型安全开发
- 采用 Tailwind CSS 进行样式管理
- 使用 Framer Motion 实现流畅动画
- 通过 Vite 实现快速热重载

## 七牛配置（推荐）

项目已支持七牛上传，最少需要配置以下环境变量：

- `VITE_STORAGE_PROVIDER=qiniu`
- `QINIU_ACCESS_KEY`
- `QINIU_SECRET_KEY`
- `QINIU_BUCKET`
- `QINIU_REGION`（`z0/z1/z2/na0/as0`）
- `QINIU_PUBLIC_URL`（公开访问域名，必须带 `https://`）

如果你在 Vercel 部署，可使用：

```bash
npx vercel env add VITE_STORAGE_PROVIDER production
npx vercel env add QINIU_ACCESS_KEY production
npx vercel env add QINIU_SECRET_KEY production
npx vercel env add QINIU_BUCKET production
npx vercel env add QINIU_REGION production
npx vercel env add QINIU_PUBLIC_URL production
```

## 📄 许可证

本项目仅供个人和家庭使用。

---

💝 用爱记录每一个美好瞬间

# Yaoyao's Time - 疯狂动物城 (Zootopia) 主题设计指南

## 1. 设计理念 (Design Philosophy)

本设计方案旨在将《疯狂动物城》充满活力、多元包容且富有童趣的视觉风格融入到 "Yaoyao's Time" 应用中。通过拟人化的设计元素、鲜艳的色彩、柔和的形状和弹性的动画，创造一个既适合儿童使用，又充满探索乐趣的数字空间。

核心关键词：**活力 (Vibrant)**、**趣味 (Playful)**、**拟人化 (Anthropomorphic)**、**包容 (Inclusive)**。

## 2. 色彩系统 (Color System)

采用电影中标志性的高饱和度色彩，结合柔和的背景色，营造轻松愉快的氛围。

### 主色调 (Primary Colors)
- **ZPD Blue (警服蓝)**: `#3B82F6` - 用于主按钮、强调文字、身份验证。
- **Judy Purple (朱迪紫)**: `#9333EA` - 用于标题、关键交互点、高亮边框。
- **Nick Orange (尼克橙)**: `#F97316` - 用于日期、提示信息、进度条。

### 辅助色 (Secondary Colors)
- **Nature Green (自然绿)**: `#10B981` - 用于成功状态、标签、生长数据。
- **Night Sky (夜空蓝)**: `#1e1b4b` - 用于全局背景（深色模式或页脚）。
- **Cream/Paper (米白/纸张)**: `#FFF7ED` - 用于卡片背景、柔和对比。

### 渐变色 (Gradients)
- **Twilight City**: `linear-gradient(135deg, #2e1065 0%, #1e1b4b 100%)`
- **Sunset**: `linear-gradient(to right, #F97316, #9333EA)`

## 3. 排版 (Typography)

选择圆润、亲和力强的字体，避免尖锐的笔画。

- **标题 (Headings)**: `Fredoka`, `Noto Sans SC` - 圆润、活泼，适合大标题。
- **正文 (Body)**: `Dongle`, `Itim`, `Noto Sans SC` - 手写风格，增加亲切感，易读性高。
- **数字 (Numbers)**: `Fredoka` - 清晰、醒目。

## 4. UI 组件库 (UI Components)

### 卡片 (Cards - `.z-card`)
- **形状**: 大圆角 (Rounded-2xl/3xl)，模仿动物爪垫或圆润的石头。
- **边框**: 4px 白色边框，增强贴纸感/徽章感。
- **阴影**: 多层柔和阴影 (`box-shadow: 0 10px 25px ...`)，营造悬浮感。
- **交互**: 悬停时轻微上浮 + 旋转，点击时下沉。

### 按钮 (Buttons - `.z-btn`)
- **形状**: 胶囊型 (Full Rounded)。
- **风格**: 拟物化 (Neumorphism-inspired)，带有明显的底部阴影 (Border-bottom) 模拟厚度。
- **反馈**: 点击时位移，模拟物理按压。

### 装饰元素 (Decorations)
- **图标**: 胡萝卜 🥕、甜甜圈 🍩、警徽 👮、爪印 🐾、冰棍 🍧。
- **背景**: 城市剪影、植物叶片、爪印图案。

## 5. 布局与栅格 (Layout & Grid)

- **容器**: 居中布局，最大宽度限制，保证阅读体验。
- **间距**: 宽松的间距 (Gap-6/8)，避免拥挤，适合触控。
- **响应式**: 移动端优先，大屏幕上采用多列卡片布局。

## 6. 动画规范 (Animation)

详见 `animation-plan.md`。核心原则是遵循物理规律的弹性 (Spring) 动画。

---
*Created by AI Assistant for Yaoyao's Time Project*

# Yaoyao's Time - 动画实现方案 (Animation Plan)

## 1. 动画设计目标

基于《疯狂动物城》的美术风格，动画应体现 **"Q弹 (Bouncy)"**、**"灵动 (Lively)"** 和 **"有趣 (Fun)"** 的特质。避免生硬的线性过渡，多使用弹簧物理效果 (Spring Physics)。

## 2. 核心动画库

- **Framer Motion**: React 生态中最强大的动画库，完美支持弹簧动画和手势交互。

## 3. 全局过渡 (Global Transitions)

### 页面切换 (Page Transition)
- **效果**: 页面内容整体滑入/滑出，带有轻微的缩放。
- **参数**: 
  - `initial={{ opacity: 0, x: -20 }}`
  - `animate={{ opacity: 1, x: 0 }}`
  - `exit={{ opacity: 0, x: 20 }}`
  - `transition={{ type: "spring", stiffness: 300, damping: 30 }}`

## 4. 微交互 (Micro-interactions)

### 按钮交互
- **悬停 (Hover)**: 
  - 放大 1.05 倍
  - 旋转 -2度 ~ 2度 (随机或交替)
  - 阴影加深
- **点击 (Tap/Active)**:
  - 缩小至 0.95 倍
  - 模拟按压效果 (Y轴位移)

### 卡片交互
- **入场**: 依次淡入并向上浮动 (Stagger Children)。
- **悬停**: 
  - 明显的上浮 (Y: -8px)
  - 随机轻微旋转 (Rotate: ±1deg)
  - 阴影扩散

### 图标动画
- **静态装饰**: 缓慢的漂浮 (Floating) 或 呼吸 (Breathing) 效果。
- **功能图标**: 
  - 导航栏图标在激活时跳动 (Bounce)。
  - 完成任务时图标放大并旋转 (Pop & Spin)。

## 5. 具体组件实现方案

### 5.1 导航栏 (Navbar)
- **Logo**: 鼠标悬停时，兔子图标进行 360度旋转或跳跃。
- **菜单项**: 切换 Tab 时，背景色块使用 `layoutId` 进行平滑流体过渡。

### 5.2 时间轴 (BioTimeline)
- **时间线**: 随着滚动动态延伸 (使用 ScrollProgress)。
- **事件卡片**: 
  - 进入视口时触发 `whileInView` 动画。
  - 展开详情时使用 `layout` 属性实现无缝尺寸变化。

### 5.3 记忆胶囊 (MemoryCapsule)
- **打开/关闭**: 
  - 展开时，内容像手风琴一样弹开。
  - 图片加载时带有淡入和轻微缩放。
- **图片切换**: 滑动切换，带有弹性阻尼。

### 5.4 成长里程碑 (GrowthMilestone)
- **进度条**: 
  - 这里的动画要模拟 "注水" 或 "赛跑" 的过程。
  - 使用 `easeInOut` 或 `spring` 缓动，让进度条增长看起来有冲劲。
- **达成庆祝**: 当进度达到 100% 时，触发五彩纸屑 (Confetti) 效果或奖杯弹跳动画。

## 6. 性能优化

- 优先使用 `transform` (scale, rotate, translate) 和 `opacity` 属性，避免触发重排 (Reflow)。
- 对于复杂列表，使用 `LayoutGroup` 确保布局动画的连贯性。
- 在移动端适当减少高消耗的模糊 (Blur) 和粒子效果。

---
*Created by AI Assistant for Yaoyao's Time Project*

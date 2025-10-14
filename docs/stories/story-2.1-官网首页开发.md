# Story 2.1: 官网首页开发

**Epic:** Epic 2 - 公众官网与报告查询功能

**优先级:** P0

**状态:** TODO

**依赖:** Story 1.1 完成（前端项目已搭建）

---

## 用户故事

作为一名**工地质检人员或潜在客户**,
我想**访问检测公司的官网首页,了解公司的基本信息**,
以便**建立对公司的信任并找到报告查询入口**。

---

## Acceptance Criteria

1. ✅ 实现响应式首页布局,包含以下模块:
   - 页头(Header):公司 Logo、公司名称、导航菜单
   - 公司简介区域:公司简介文字(2-3段)、资质证书图片展示
   - 服务范围区域:列出主要检测服务项目
   - 报告查询区域:突出显示报告查询输入框和查询按钮
   - 联系方式区域:电话、邮箱、地址
   - 页脚(Footer):版权信息、备案号

2. ✅ 页面在桌面端、平板端和手机端均能正常显示,布局自适应
3. ✅ 报告查询输入框聚焦时有明显的视觉反馈
4. ✅ 点击查询按钮(暂时不实现查询逻辑,仅跳转到查询结果页占位符)
5. ✅ 页面加载时间 < 2秒(优化图片大小和资源加载)
6. ✅ 页面符合基本的 SEO 要求(HTML语义化标签、Meta标签)
7. ✅ 测试页面在Chrome、Safari、Edge浏览器上的显示效果
8. ✅ 确保首页内容可通过环境变量或配置文件灵活修改(如公司名称、联系方式)

---

## 技术要点

### 页面结构
```
HomePage
├── Header (Logo + 导航)
├── HeroSection (报告查询区域)
├── AboutSection (公司简介)
├── ServicesSection (服务范围)
├── ContactSection (联系方式)
└── Footer (版权信息)
```

### 技术栈
- **框架**: React 18
- **样式**: TailwindCSS + Ant Design 5
- **路由**: React Router
- **状态管理**: React Hooks
- **SEO**: React Helmet

### 响应式断点
```css
/* TailwindCSS 默认断点 */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 笔记本 */
xl: 1280px  /* 桌面 */
```

### 配置管理
```typescript
// src/config/site.ts
export const siteConfig = {
  companyName: '浙江XXX检测技术有限公司',
  logo: '/logo.png',
  contact: {
    phone: '0571-12345678',
    email: 'info@example.com',
    address: '浙江省杭州市XXX区XXX路XXX号'
  },
  icp: '浙ICP备XXXXXXXX号'
}
```

---

## 任务拆解

- [ ] 创建 `src/pages/HomePage.tsx` 组件
- [ ] 创建子组件
  - [ ] `src/components/Header.tsx`
  - [ ] `src/components/HeroSection.tsx` (报告查询区域)
  - [ ] `src/components/AboutSection.tsx`
  - [ ] `src/components/ServicesSection.tsx`
  - [ ] `src/components/ContactSection.tsx`
  - [ ] `src/components/Footer.tsx`
- [ ] 使用 TailwindCSS 实现响应式布局
- [ ] 使用 Ant Design 组件 (Input, Button)
- [ ] 实现查询按钮点击事件 (暂时跳转到占位符页面)
- [ ] 配置 React Helmet 设置 SEO Meta 标签
- [ ] 创建 `src/config/site.ts` 配置文件
- [ ] 优化图片资源 (使用 WebP 格式)
- [ ] 测试不同设备和浏览器
- [ ] 性能优化 (Lazy loading 图片)

---

## 验收测试

### 桌面端测试
```
浏览器: Chrome, Safari, Edge
分辨率: 1920x1080, 1440x900
- 检查所有模块是否正确显示
- 检查布局是否居中对齐
- 检查图片是否清晰
```

### 移动端测试
```
设备: iPhone 12, iPad, Android手机
分辨率: 375x667 (iPhone), 768x1024 (iPad)
- 检查是否自适应布局
- 检查文字大小是否合适
- 检查触摸区域是否足够大
```

### 性能测试
```bash
# 使用 Lighthouse 测试性能
npm run build
npx serve -s dist
# 在 Chrome DevTools 中运行 Lighthouse
# Performance 分数应 > 90
# Accessibility 分数应 > 90
```

### SEO 测试
```html
<!-- 检查 HTML head 标签 -->
<head>
  <title>浙江XXX检测技术有限公司 - 专业设备检测服务</title>
  <meta name="description" content="...">
  <meta name="keywords" content="设备检测,检测报告,委托检验">
</head>
```

---

## 参考文档

- [ui-ux-design.md](../ui-ux-design.md) - UI/UX 设计文档
- [Ant Design Components](https://ant.design/components/overview)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

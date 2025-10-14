# Story 1.1: 项目初始化与开发环境搭建

**Epic:** Epic 1 - 项目基础设施与核心数据模型

**优先级:** P0

**状态:** TODO

---

## 用户故事

作为一名**开发工程师**，
我想**初始化项目仓库并搭建本地开发环境**，
以便**快速开始功能开发并确保团队协作的一致性**。

---

## Acceptance Criteria

1. ✅ 创建 Git 仓库并初始化项目结构（Monorepo，使用 pnpm workspaces）
2. ✅ 配置前端项目（React），包括基础路由、样式系统（TailwindCSS）和构建工具（Vite）
3. ✅ 配置后端项目（Node.js Express），包括基础框架、环境变量管理和日志系统
4. ✅ 配置数据库连接（MySQL），确保本地开发环境可正常连接
5. ✅ 编写 README.md 文档，说明项目结构、环境要求和启动步骤
6. ✅ 配置代码格式化工具（Prettier、ESLint）和 Git Hooks（Husky + lint-staged）
7. ✅ 实现一个简单的健康检查端点（`GET /api/health`），返回系统状态
8. ✅ 前端能够成功启动并显示一个"欢迎页面"或"开发中"页面
9. ✅ 后端能够成功启动并通过健康检查端点返回 200 状态
10. ✅ 提交初始代码到 Git 仓库，包含清晰的 commit 信息

---

## 技术要点

### 项目结构
```
checkReport/
├── apps/
│   ├── web/          # React 前端应用
│   └── api/          # Node.js 后端应用
├── packages/         # 共享代码包
├── docs/            # 项目文档
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### 技术栈
- **包管理:** pnpm workspaces
- **前端:** React 18 + Vite + TailwindCSS + Ant Design 5
- **后端:** Node.js + Express + Prisma ORM
- **数据库:** MySQL 8.0+
- **代码规范:** ESLint + Prettier + Husky

### 健康检查端点
```javascript
GET /api/health
Response: {
  "status": "healthy",
  "timestamp": "2025-10-13T12:00:00Z"
}
```

---

## 任务拆解

- [ ] 初始化 Git 仓库和 pnpm workspace
- [ ] 配置前端项目（apps/web）
  - [ ] 安装 React + Vite
  - [ ] 配置 TailwindCSS
  - [ ] 安装 Ant Design 5
  - [ ] 配置基础路由（React Router）
- [ ] 配置后端项目（apps/api）
  - [ ] 安装 Express
  - [ ] 配置环境变量（dotenv）
  - [ ] 配置日志系统（winston/pino）
  - [ ] 实现健康检查端点
- [ ] 配置 Prisma ORM
  - [ ] 安装 Prisma CLI
  - [ ] 配置 MySQL 连接
  - [ ] 生成 Prisma Client
- [ ] 配置开发工具
  - [ ] 安装 ESLint + Prettier
  - [ ] 配置 Husky + lint-staged
- [ ] 编写 README.md
- [ ] 测试前后端启动
- [ ] Git 提交

---

## 验收测试

### 前端测试
```bash
cd apps/web
pnpm dev
# 浏览器访问 http://localhost:5173
# 应该看到欢迎页面
```

### 后端测试
```bash
cd apps/api
pnpm dev
# 测试健康检查端点
curl http://localhost:3000/api/health
# 应该返回 {"status":"healthy","timestamp":"..."}
```

---

## 参考文档

- [architecture.md](../architecture.md) - 架构设计文档
- [database-design.md](../database-design.md) - 数据库设计文档
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vite Documentation](https://vitejs.dev)

# 检测报告在线查询系统

浙江省某检测技术有限公司的设备检测报告在线查询平台。

## 📋 项目简介

本系统为检测公司提供报告在线查询服务,工地质检人员可通过报告编号快速查询和下载检测报告。

**主要功能:**
- 🔍 公众报告查询 - 通过报告编号查询和查看检测报告
- 📄 报告预览下载 - 支持PDF、JPG、PNG格式预览和下载
- 🔐 管理后台 - 管理员登录、报告上传、编辑、删除
- 📱 响应式设计 - 支持桌面端、平板和移动端访问

## 🏗️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: Ant Design 5
- **样式**: TailwindCSS
- **路由**: React Router v7
- **HTTP客户端**: Axios
- **日期处理**: dayjs

### 后端
- **运行时**: Node.js + TypeScript
- **框架**: Express
- **ORM**: Prisma
- **数据库**: MySQL 8.0+
- **认证**: JWT + bcrypt
- **文件上传**: Multer
- **日志**: Winston

### 开发工具
- **包管理**: pnpm (Monorepo)
- **代码格式化**: Prettier
- **版本控制**: Git

## 📁 项目结构

\`\`\`
checkReport/
├── apps/
│   ├── web/                # React 前端应用
│   │   ├── src/
│   │   │   ├── components/ # React 组件
│   │   │   ├── pages/      # 页面组件
│   │   │   ├── services/   # API 服务
│   │   │   └── App.tsx
│   │   └── package.json
│   └── api/                # Node.js 后端应用
│       ├── src/
│       │   ├── routes/     # API 路由
│       │   ├── middleware/ # 中间件
│       │   ├── utils/      # 工具函数
│       │   └── index.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
├── docs/                   # 项目文档
│   ├── architecture.md     # 架构设计
│   ├── database-design.md  # 数据库设计
│   ├── api-design.md       # API 接口设计
│   └── stories/            # 开发任务 Story
├── pnpm-workspace.yaml
└── package.json
\`\`\`

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL >= 8.0

### 安装依赖

\`\`\`bash
# 安装 pnpm (如果尚未安装)
npm install -g pnpm

# 安装所有依赖
pnpm install
\`\`\`

### 配置数据库

1. 创建 MySQL 数据库:

\`\`\`sql
CREATE DATABASE checkReport CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

2. 配置环境变量 \`apps/api/.env\`:

\`\`\`env
DATABASE_URL="mysql://root:your_password@localhost:3306/checkReport"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
\`\`\`

3. 运行数据库迁移:

\`\`\`bash
cd apps/api
pnpm prisma migrate dev --name init
\`\`\`

4. 初始化数据 (创建默认管理员):

\`\`\`bash
pnpm prisma db seed
# 默认管理员账号: admin / Admin@123
\`\`\`

### 启动开发服务器

\`\`\`bash
# 在项目根目录

# 启动后端 (端口 3000)
pnpm dev:api

# 启动前端 (端口 5173)
pnpm dev:web

# 同时启动前后端
pnpm dev
\`\`\`

访问地址:
- 前端: http://localhost:5173
- 后端 API: http://localhost:3000
- 健康检查: http://localhost:3000/api/health

## 🔧 开发命令

\`\`\`bash
# 开发
pnpm dev              # 启动前后端开发服务器
pnpm dev:web          # 仅启动前端
pnpm dev:api          # 仅启动后端

# 构建
pnpm build            # 构建前后端生产版本

# 代码质量
pnpm lint             # 运行所有 lint 检查
pnpm format           # 格式化代码 (Prettier)

# 测试
pnpm test             # 运行所有测试

# Prisma 命令
cd apps/api
pnpm prisma studio    # 打开 Prisma Studio 数据库管理界面
pnpm prisma generate  # 生成 Prisma Client
pnpm prisma migrate dev # 创建新的数据库迁移
\`\`\`

## 📖 API 文档

详细 API 文档请查看: [docs/api-design.md](./docs/api-design.md)

### 主要接口

**公众接口:**
- \`GET /api/health\` - 健康检查
- \`GET /api/reports/:reportNumber\` - 查询报告

**管理接口 (需要认证):**
- \`POST /admin/login\` - 管理员登录
- \`GET /admin/reports\` - 报告列表 (分页)
- \`POST /admin/upload\` - 上传文件
- \`POST /admin/reports\` - 创建报告
- \`PUT /admin/reports/:id\` - 更新报告
- \`DELETE /admin/reports/:id\` - 删除报告
- \`GET /admin/stats\` - 统计数据

## 🗄️ 数据库设计

详细数据库设计请查看: [docs/database-design.md](./docs/database-design.md)

### 核心表

**reports** - 报告表
- 存储报告元数据 (编号、类型、日期、设备信息等)
- 文件路径和类型

**admins** - 管理员表
- 管理员账号
- bcrypt 加密密码

## 🎨 UI 设计

详细 UI/UX 设计请查看: [docs/ui-ux-design.md](./docs/ui-ux-design.md)

## 📝 开发流程

本项目采用 **BMad 开发方法论**,每个功能都拆分为独立的 Story:

1. 查看 \`docs/stories/\` 目录下的 Story 文件
2. 按优先级 (P0 → P1 → P2) 依次开发
3. 每个 Story 包含详细的验收标准和测试用例

**当前 Story 列表:**
- Story 1.1: 项目初始化与开发环境搭建 ✅
- Story 1.2: 数据库模型设计与实现
- Story 1.3: 报告查询API开发
- ... (查看 docs/stories/ 了解全部)

## 🔐 安全说明

### 生产环境部署前必做:

1. **更改 JWT 密钥**: 修改 \`.env\` 中的 \`JWT_SECRET\` 为强随机字符串
2. **配置 HTTPS**: 使用 Nginx 配置 SSL 证书
3. **数据库安全**: 使用强密码,限制数据库访问权限
4. **文件上传限制**: 已配置文件类型和大小限制 (PDF/JPG/PNG, max 10MB)

## 📦 部署

详细部署说明请查看: [docs/architecture.md#部署架构](./docs/architecture.md)

### 生产环境构建

\`\`\`bash
# 构建前后端
pnpm build

# 启动后端生产服务
cd apps/api
pnpm start

# 前端部署到 Nginx
# 将 apps/web/dist 目录部署到 Nginx 静态目录
\`\`\`

## 🤝 贡献

本项目为内部项目,暂不接受外部贡献。

## 📄 许可证

内部项目,保留所有权利。

---

**开发团队:** 浙江XXX检测技术有限公司
**文档更新:** 2025-10-13

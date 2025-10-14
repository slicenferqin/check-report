# Development Workflow

## Local Development Setup

### Prerequisites

```bash
# 安装 Node.js 18+ 和 pnpm
node --version  # 确保 >= 18.0.0
pnpm --version  # 确保 >= 8.0.0

# 安装 MySQL 8.0+
mysql --version

# 创建上传文件目录
mkdir -p /var/www/checkReport/uploads
```

### Initial Setup

```bash
# 1. 克隆仓库
git clone <repository-url>
cd checkReport

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example apps/api/.env
# 编辑 apps/api/.env，填写数据库配置和上传目录

cp .env.example apps/web/.env.local
# 编辑 apps/web/.env.local，配置 API 地址

# 4. 初始化数据库
cd apps/api
pnpm prisma migrate dev --name init
pnpm prisma db seed  # 创建初始管理员账号

# 5. 生成 Prisma Client
pnpm prisma generate
```

### Development Commands

```bash
# 启动所有服务（在项目根目录）
pnpm dev

# 启动前端（在项目根目录或 apps/web）
pnpm --filter web dev
# 访问 http://localhost:5173

# 启动后端（在项目根目录或 apps/api）
pnpm --filter api dev
# 访问 http://localhost:3000

# 运行测试
pnpm test                    # 所有测试
pnpm --filter web test       # 前端测试
pnpm --filter api test       # 后端测试

# 代码检查和格式化
pnpm lint                    # ESLint 检查
pnpm format                  # Prettier 格式化

# 数据库操作
cd apps/api
pnpm prisma studio           # 打开数据库 GUI
pnpm prisma migrate dev      # 创建新迁移
pnpm prisma migrate reset    # 重置数据库
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local in apps/web)
VITE_API_BASE_URL=http://localhost:3000/api  # 后端 API 地址

# Backend (.env in apps/api)
# 数据库配置
DATABASE_URL=mysql://user:password@localhost:3306/checkReport

# JWT 配置
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_DIR=/var/www/checkReport/uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png

# 服务器配置
PORT=3000
NODE_ENV=development

# 日志配置
LOG_LEVEL=info
```

---

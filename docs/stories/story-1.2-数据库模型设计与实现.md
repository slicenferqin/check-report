# Story 1.2: 数据库模型设计与实现

**Epic:** Epic 1 - 项目基础设施与核心数据模型

**优先级:** P0

**状态:** TODO

**依赖:** Story 1.1 完成

---

## 用户故事

作为一名**后端开发工程师**，
我想**设计并实现报告和管理员的数据库模型**，
以便**为后续的业务逻辑提供数据存储支持**。

---

## Acceptance Criteria

1. ✅ 设计 `reports` 表，包含以下字段：
   - `id`（主键，自增）
   - `report_number`（报告编号，唯一索引，VARCHAR）
   - `report_type`（报告类型，ENUM: 'INSPECTION_CERT', 'INSTALLATION_INSPECTION'）
   - `inspection_date`（检测日期，DATE）
   - `equipment_name`（设备名称，VARCHAR）
   - `client_company`（委托单位，VARCHAR）
   - `user_company`（使用单位，VARCHAR）
   - `file_url`（报告文件 URL，VARCHAR）
   - `file_type`（文件类型，ENUM: 'PDF', 'JPG', 'PNG'）
   - `created_at`（创建时间，TIMESTAMP）
   - `updated_at`（更新时间，TIMESTAMP）

2. ✅ 设计 `admins` 表，包含以下字段：
   - `id`（主键，自增）
   - `username`（用户名，唯一，VARCHAR）
   - `password_hash`（密码哈希值，VARCHAR）
   - `created_at`（创建时间，TIMESTAMP）

3. ✅ 使用 Prisma 创建数据库表结构（编写 schema.prisma）
4. ✅ 执行数据库迁移（`prisma migrate dev`）
5. ✅ 编写数据库初始化脚本，创建测试管理员账号（用户名: `admin`，密码: `Admin@123`）
6. ✅ 验证数据库表创建成功，能够通过 SQL 客户端或 Prisma Studio 查看表结构
7. ✅ 编写数据模型文档，说明各字段的用途和约束

---

## 技术要点

### Prisma Schema
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum ReportType {
  INSPECTION_CERT
  INSTALLATION_INSPECTION
}

enum FileType {
  PDF
  JPG
  PNG
}

model Report {
  id             Int        @id @default(autoincrement()) @db.UnsignedInt
  reportNumber   String     @unique @map("report_number") @db.VarChar(50)
  reportType     ReportType @map("report_type")
  inspectionDate DateTime   @map("inspection_date") @db.Date
  equipmentName  String     @map("equipment_name") @db.VarChar(200)
  clientCompany  String     @map("client_company") @db.VarChar(200)
  userCompany    String     @map("user_company") @db.VarChar(200)
  fileUrl        String     @map("file_url") @db.VarChar(500)
  fileType       FileType   @map("file_type")
  createdAt      DateTime   @default(now()) @map("created_at") @db.Timestamp(0)
  updatedAt      DateTime   @updatedAt @map("updated_at") @db.Timestamp(0)

  @@index([reportNumber], map: "uk_report_number")
  @@index([inspectionDate], map: "idx_inspection_date")
  @@index([createdAt], map: "idx_created_at")
  @@map("reports")
}

model Admin {
  id           Int      @id @default(autoincrement()) @db.UnsignedInt
  username     String   @unique @db.VarChar(50)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamp(0)

  @@index([username], map: "uk_username")
  @@map("admins")
}
```

### 数据库初始化脚本
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 创建默认管理员
  const passwordHash = await bcrypt.hash('Admin@123', 10)
  await prisma.admin.create({
    data: {
      username: 'admin',
      passwordHash,
    },
  })

  console.log('✅ 默认管理员账号创建成功: admin / Admin@123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## 任务拆解

- [ ] 编写 `prisma/schema.prisma` 文件
- [ ] 配置 `.env` 文件中的 `DATABASE_URL`
- [ ] 执行 `prisma migrate dev --name init` 创建初始迁移
- [ ] 编写 `prisma/seed.ts` 种子脚本
- [ ] 在 `package.json` 中添加 seed 命令
- [ ] 执行 `pnpm prisma db seed` 初始化数据
- [ ] 使用 Prisma Studio 验证数据（`pnpm prisma studio`）
- [ ] 更新文档说明数据库模型

---

## 验收测试

### 执行迁移
```bash
cd apps/api
pnpm prisma migrate dev --name init
# 应该成功创建 reports 和 admins 表
```

### 初始化数据
```bash
pnpm prisma db seed
# 应该创建默认管理员账号
```

### 查看数据
```bash
pnpm prisma studio
# 打开 Prisma Studio，查看 admins 表中是否有 admin 用户
```

### SQL 验证
```sql
USE checkReport;
SHOW TABLES;
-- 应该看到 reports 和 admins 表

DESCRIBE reports;
DESCRIBE admins;

SELECT * FROM admins;
-- 应该看到 username='admin' 的记录
```

---

## 参考文档

- [database-design.md](../database-design.md) - 数据库设计详细文档
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

# Epic 1: 项目基础设施与核心数据模型

**目标：** 搭建完整的开发环境和项目结构，设计并实现数据库模型，开发核心后端 API 接口，为后续功能开发奠定坚实基础。同时实现一个简单的健康检查端点，验证系统基础设施的可用性。

## Story 1.1: 项目初始化与开发环境搭建

**用户故事：**

作为一名**开发工程师**，
我想**初始化项目仓库并搭建本地开发环境**，
以便**快速开始功能开发并确保团队协作的一致性**。

**Acceptance Criteria:**

1. 创建 Git 仓库并初始化项目结构（Monorepo 或 Polyrepo，根据技术假设选择）
2. 配置前端项目（React 或 Vue），包括基础路由、样式系统（TailwindCSS）和构建工具（Vite 或 Webpack）
3. 配置后端项目（Node.js Express/Nest.js 或 Python FastAPI），包括基础框架、环境变量管理和日志系统
4. 配置数据库连接（PostgreSQL 或 MySQL），确保本地开发环境可正常连接
5. 编写 README.md 文档，说明项目结构、环境要求和启动步骤
6. 配置代码格式化工具（Prettier、ESLint）和 Git Hooks（可选：Husky + lint-staged）
7. 实现一个简单的健康检查端点（`GET /api/health`），返回系统状态
8. 前端能够成功启动并显示一个"欢迎页面"或"开发中"页面
9. 后端能够成功启动并通过健康检查端点返回 200 状态
10. 提交初始代码到 Git 仓库，包含清晰的 commit 信息

---

## Story 1.2: 数据库模型设计与实现

**用户故事：**

作为一名**后端开发工程师**，
我想**设计并实现报告和管理员的数据库模型**，
以便**为后续的业务逻辑提供数据存储支持**。

**Acceptance Criteria:**

1. 设计 `reports` 表，包含以下字段：
   - `id`（主键，自增）
   - `report_number`（报告编号，唯一索引，VARCHAR）
   - `report_type`（报告类型，ENUM: '检测合格证', '安装委托检验'）
   - `inspection_date`（检测日期，DATE）
   - `equipment_name`（设备名称，VARCHAR）
   - `client_company`（委托单位，VARCHAR）
   - `user_company`（使用单位，VARCHAR）
   - `file_url`（报告文件 URL，VARCHAR）
   - `file_type`（文件类型，ENUM: 'PDF', 'JPG', 'PNG'）
   - `created_at`（创建时间，TIMESTAMP）
   - `updated_at`（更新时间，TIMESTAMP）
2. 设计 `admins` 表，包含以下字段：
   - `id`（主键，自增）
   - `username`（用户名，唯一，VARCHAR）
   - `password_hash`（密码哈希值，VARCHAR）
   - `created_at`（创建时间，TIMESTAMP）
3. 使用数据库迁移工具（如 Prisma、TypeORM、Alembic）创建数据库表结构
4. 编写数据库初始化脚本，创建至少一个测试管理员账号（用户名: `admin`，密码: `Admin@123`）
5. 验证数据库表创建成功，能够通过 SQL 客户端或 ORM 工具查看表结构
6. 编写数据模型文档，说明各字段的用途和约束

---

## Story 1.3: 报告查询 API 开发

**用户故事：**

作为一名**后端开发工程师**，
我想**开发报告查询的 RESTful API 接口**，
以便**前端能够根据报告编号获取报告详情**。

**Acceptance Criteria:**

1. 实现 `GET /api/reports/:reportNumber` 接口，根据报告编号查询报告
2. 查询成功时，返回 200 状态码和报告详情 JSON（包含所有字段）
3. 报告不存在时，返回 404 状态码和错误信息 `{ "error": "未找到该报告，请确认报告编号是否正确" }`
4. 实现输入验证，报告编号不能为空，否则返回 400 状态码
5. 实现错误处理，数据库查询失败时返回 500 状态码和通用错误信息
6. 编写单元测试，覆盖成功查询、报告不存在、输入无效等场景
7. 使用 Postman 或类似工具测试 API 端点，确保返回数据格式正确
8. 更新 API 文档（Swagger 或 README），说明接口的请求和响应格式

---

## Story 1.4: 报告上传 API 开发（元数据部分）

**用户故事：**

作为一名**后端开发工程师**，
我想**开发报告元数据创建的 API 接口**，
以便**管理员能够添加新的报告记录**。

**Acceptance Criteria:**

1. 实现 `POST /api/admin/reports` 接口，接收报告元数据（JSON 格式）
2. 接口必须包含身份认证中间件，验证请求中的 JWT Token
3. 接收的字段包括：`report_number`、`report_type`、`inspection_date`、`equipment_name`、`client_company`、`user_company`、`file_url`、`file_type`
4. 验证所有必填字段不能为空，报告编号必须唯一（不能重复）
5. 验证报告类型和文件类型必须为枚举值中的一个
6. 数据验证通过后，将报告信息保存到数据库，返回 201 状态码和新创建的报告 JSON
7. 报告编号重复时，返回 409 状态码和错误信息 `{ "error": "报告编号已存在" }`
8. 数据验证失败时，返回 400 状态码和具体的验证错误信息
9. 编写单元测试，覆盖成功创建、编号重复、字段缺失等场景
10. 更新 API 文档，说明接口的认证方式和请求/响应格式

**注意：** 此 Story 仅处理元数据，文件上传将在后续 Story 中实现。

---

## Story 1.5: 文件上传服务集成

**用户故事：**

作为一名**后端开发工程师**，
我想**集成云对象存储服务（OSS）用于报告文件上传**，
以便**管理员能够上传报告扫描件并获取文件 URL**。

**Acceptance Criteria:**

1. 配置云对象存储（阿里云 OSS 或腾讯云 COS）的访问密钥和存储桶
2. 实现文件上传工具类或模块，封装 OSS SDK 的上传操作
3. 实现 `POST /api/admin/upload` 接口，接收文件上传（multipart/form-data）
4. 接口必须包含身份认证中间件，验证 JWT Token
5. 验证上传文件的类型（只允许 PDF、JPG、PNG），大小不超过 10MB
6. 文件验证通过后，上传到 OSS，使用 UUID 或时间戳生成唯一文件名
7. 上传成功后，返回 200 状态码和文件 URL `{ "file_url": "https://...", "file_type": "PDF" }`
8. 文件类型或大小不符合要求时，返回 400 状态码和错误信息
9. OSS 上传失败时，返回 500 状态码和错误信息
10. 编写单元测试或集成测试，模拟文件上传流程（可使用 Mock OSS）
11. 更新 API 文档，说明文件上传的格式和限制

---

# 检测报告在线查询系统 Fullstack Architecture Document

**项目名称：** 浙江省牛叉检测技术有限公司官网与报告查询系统
**文档版本：** 1.0
**创建日期：** 2025-10-11
**负责人：** Winston（架构师）
**基于文档：** PRD v1.0

---

## Introduction

本文档概述了"检测报告在线查询系统"的完整全栈架构，包括后端系统、前端实现及其集成方案。它作为 AI 驱动开发的唯一真实来源，确保整个技术栈的一致性。

这种统一的方法结合了传统上独立的后端和前端架构文档，简化了现代全栈应用的开发流程，因为这些关注点越来越紧密地交织在一起。

### Starter Template or Existing Project

**N/A - Greenfield 项目**

本项目为全新开发项目，不基于任何现有的 starter template。我们将从零开始构建，采用最适合项目需求的技术栈。

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-11 | 1.0 | 初始架构文档创建 | Winston (Architect) |

---

## High Level Architecture

### Technical Summary

本系统采用**单体架构**的全栈 Web 应用，前后端分离设计。前端使用 **React 18** 构建响应式 SPA，通过 **RESTful API** 与后端通信。后端基于 **Node.js (Express)** 提供 API 服务，使用 **MySQL** 存储结构化数据，报告文件直接存储在**服务器本地文件系统**（上传目录）。管理后台采用 **JWT Token** 认证，确保安全性。系统可部署在任意 Linux 服务器上，前端使用 Nginx 托管静态文件，后端使用 PM2 管理 Node.js 进程。这种架构简单直接，开发和维护成本低，非常适合小型团队快速交付 MVP，未来可根据需求扩展至云存储方案。

### Platform and Infrastructure Choice

**平台选择：独立服务器部署**

**选择理由：**
1. **成本优势：** MVP 阶段无需云存储服务费用，降低初期成本
2. **简单直接：** 本地文件系统存储，无需额外配置 OSS SDK
3. **易于开发：** 开发环境和生产环境配置一致，简化部署流程
4. **灵活扩展：** 未来可根据需求迁移到云存储服务（阿里云 OSS 或腾讯云 COS）

**核心服务：**
- **Linux 服务器：** 部署后端 Node.js 应用（推荐 Ubuntu 20.04+）
- **MySQL 数据库：** 本地或远程 MySQL 实例
- **Nginx：** 反向代理 + 静态文件服务器
- **PM2：** Node.js 进程管理和自动重启
- **文件存储：** 服务器本地目录（如 `/var/www/checkReport/uploads`）

**部署区域：** 根据实际服务器位置，建议靠近目标用户群体（浙江省）

---

### Repository Structure

**结构：Monorepo**

**Monorepo 工具：pnpm workspaces**

**选择理由：**
1. **团队规模小：** 1-2 名开发者，Monorepo 简化依赖管理和代码共享
2. **类型共享：** 前后端共享 TypeScript 类型定义，减少重复
3. **统一构建：** 一次性运行所有测试和构建任务
4. **版本管理：** 前后端版本同步，避免兼容性问题

**包组织策略：**
```
checkReport/                    # 项目根目录
├── apps/                       # 应用层
│   ├── web/                    # 前端应用
│   └── api/                    # 后端应用
├── packages/                   # 共享包
│   ├── shared/                 # 共享类型和工具
│   └── config/                 # 共享配置
```

---

### High Level Architecture Diagram

```mermaid
graph TB
    User[用户/管理员]
    Browser[浏览器]
    Nginx[Nginx<br/>静态文件 + 反向代理]
    Backend[Node.js + Express<br/>API 服务]
    MySQL[MySQL 数据库]
    FileSystem[本地文件系统<br/>/uploads]

    User -->|访问网站| Browser
    Browser -->|请求静态资源| Nginx
    Browser -->|API 请求| Nginx
    Nginx -->|反向代理| Backend
    Backend -->|读写数据| MySQL
    Backend -->|上传/读取文件| FileSystem
    Nginx -->|文件访问| FileSystem

    style User fill:#e1f5ff
    style Browser fill:#fff4e1
    style Nginx fill:#e8f5e9
    style Backend fill:#ffe0e0
    style MySQL fill:#f3e5f5
    style FileSystem fill:#fff3cd
```

---

### Architectural Patterns

- **前后端分离（SPA + API）：** 前端 React SPA 通过 RESTful API 与后端通信，实现清晰的职责分离。_Rationale:_ 提高开发效率，前后端可独立开发和部署，便于未来扩展移动端或小程序。

- **分层架构（Layered Architecture）：** 后端采用 Controller-Service-Repository 三层结构，分离路由处理、业务逻辑和数据访问。_Rationale:_ 提高代码可维护性和可测试性，便于单元测试和集成测试。

- **Repository 模式：** 封装数据库访问逻辑，提供统一的数据操作接口。_Rationale:_ 降低业务逻辑与数据库的耦合，未来可轻松切换数据库或 ORM。

- **JWT 无状态认证：** 使用 JWT Token 进行管理员身份认证，无需服务器端 Session。_Rationale:_ 简化后端架构，支持水平扩展，适合 RESTful API。

- **响应式设计（Mobile-First）：** 前端采用移动端优先的响应式设计，使用 TailwindCSS 实现自适应布局。_Rationale:_ 60%+ 用户通过移动端访问，优先保证移动端体验。

- **本地文件存储：** 报告文件上传到服务器本地文件系统，后端存储文件路径元数据。_Rationale:_ 简化架构，降低开发和运营成本，适合初期文件量不大的场景。

---

## Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | 类型安全的前端开发 | 提供静态类型检查，减少运行时错误，提高代码可维护性 |
| Frontend Framework | React | 18.2+ | 构建用户界面 | 生态成熟，组件化开发，虚拟 DOM 性能优异，社区资源丰富 |
| UI Component Library | Ant Design | 5.12+ | 企业级 UI 组件库 | 开箱即用的高质量组件，适合快速构建后台管理界面和官网 |
| State Management | React Context + Hooks | - | 轻量级状态管理 | 项目状态简单（认证状态、查询状态），无需引入 Redux/Zustand |
| Backend Language | TypeScript | 5.3+ | 类型安全的后端开发 | 与前端共享类型定义，减少接口对接错误 |
| Backend Framework | Express.js | 4.18+ | Node.js Web 框架 | 轻量灵活，中间件生态丰富，适合快速开发 RESTful API |
| API Style | REST | - | HTTP RESTful API | 简单直观，浏览器原生支持，适合公开查询接口和后台管理 API |
| Database | MySQL | 8.0+ | 关系型数据库 | 开源成熟，社区活跃，性能优异，ACID 事务保证数据一致性 |
| ORM | Prisma | 5.7+ | 类型安全的 ORM | 自动生成 TypeScript 类型，迁移管理便捷，查询性能优秀，支持 MySQL |
| Cache | 内存缓存（node-cache） | 5.1+ | 轻量级缓存 | MVP 阶段使用内存缓存即可，未来可升级为 Redis |
| File Storage | Multer + 本地文件系统 | multer 1.4+ | 文件上传中间件 | 简单易用，直接存储到服务器本地目录，无需额外服务费用 |
| Authentication | JWT + bcrypt | jsonwebtoken 9.0+, bcrypt 5.1+ | 身份认证和密码加密 | 无状态认证，支持水平扩展，bcrypt 防止密码彩虹表攻击 |
| Frontend Testing | Vitest + React Testing Library | Vitest 1.0+, RTL 14+ | 前端单元测试 | Vite 原生支持，速度快，RTL 贴近用户使用方式 |
| Backend Testing | Jest + Supertest | Jest 29+, Supertest 6+ | 后端单元和集成测试 | Jest 功能完善，Supertest 方便测试 HTTP 接口 |
| E2E Testing | Playwright | 1.40+ | 端到端测试 | 跨浏览器支持，自动等待机制，调试体验好 |
| Build Tool | pnpm | 8.10+ | 包管理和构建工具 | 速度快，节省磁盘空间，支持 workspace monorepo |
| Bundler | Vite | 5.0+ | 前端构建工具 | 开发环境启动快，HMR 响应迅速，生产环境优化好 |
| IaC Tool | 手动配置 | - | 基础设施即代码（暂不使用） | MVP 阶段手动配置即可，未来可引入 Terraform 或 Pulumi |
| CI/CD | GitHub Actions | - | 持续集成/部署 | 与 GitHub 深度集成，免费额度充足，配置简单 |
| Monitoring | PM2 + Winston | - | 进程监控和日志 | PM2 提供进程监控和重启，Winston 记录应用日志 |
| Logging | Winston | 3.11+ | 后端日志记录 | 支持多种传输方式，日志级别控制，生产环境必备 |
| CSS Framework | TailwindCSS | 3.4+ | 实用优先的 CSS 框架 | 快速构建响应式界面，与 Ant Design 配合使用，自定义样式灵活 |

---

## Data Models

### Report（报告）

**Purpose:** 存储检测报告的元数据信息，是系统的核心业务实体。

**Key Attributes:**
- `id`: number - 主键，自增 ID
- `reportNumber`: string - 报告编号（唯一索引）
- `reportType`: enum - 报告类型（'INSPECTION_CERT' | 'INSTALLATION_INSPECTION'）
- `inspectionDate`: Date - 检测日期
- `equipmentName`: string - 设备名称
- `clientCompany`: string - 委托单位
- `userCompany`: string - 使用单位
- `fileUrl`: string - 报告文件路径（相对于 uploads 目录）
- `fileType`: enum - 文件类型（'PDF' | 'JPG' | 'PNG'）
- `createdAt`: Date - 创建时间
- `updatedAt`: Date - 更新时间

#### TypeScript Interface

```typescript
export enum ReportType {
  INSPECTION_CERT = 'INSPECTION_CERT',       // 检测合格证
  INSTALLATION_INSPECTION = 'INSTALLATION_INSPECTION' // 安装委托检验
}

export enum FileType {
  PDF = 'PDF',
  JPG = 'JPG',
  PNG = 'PNG'
}

export interface Report {
  id: number;
  reportNumber: string;
  reportType: ReportType;
  inspectionDate: Date;
  equipmentName: string;
  clientCompany: string;
  userCompany: string;
  fileUrl: string;
  fileType: FileType;
  createdAt: Date;
  updatedAt: Date;
}

// API 请求/响应类型
export interface CreateReportDto {
  reportNumber: string;
  reportType: ReportType;
  inspectionDate: string; // ISO 8601 格式
  equipmentName: string;
  clientCompany: string;
  userCompany: string;
  fileUrl: string;
  fileType: FileType;
}

export interface UpdateReportDto {
  reportType?: ReportType;
  inspectionDate?: string;
  equipmentName?: string;
  clientCompany?: string;
  userCompany?: string;
}

export interface ReportListQuery {
  page?: number;
  limit?: number;
  search?: string; // 搜索报告编号
}
```

#### Relationships
- 无直接关联的其他实体（MVP 阶段）

---

### Admin（管理员）

**Purpose:** 存储管理员账号信息，用于后台登录认证。

**Key Attributes:**
- `id`: number - 主键，自增 ID
- `username`: string - 用户名（唯一）
- `passwordHash`: string - bcrypt 加密后的密码
- `createdAt`: Date - 创建时间

#### TypeScript Interface

```typescript
export interface Admin {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

// API 请求/响应类型
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  expiresIn: number; // Token 有效期（秒）
}

export interface AdminPayload {
  id: number;
  username: string;
}
```

#### Relationships
- 无直接关联的其他实体（MVP 阶段未实现操作日志等功能）

---

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: 检测报告查询系统 API
  version: 1.0.0
  description: 提供报告查询和管理功能的 RESTful API

servers:
  - url: http://localhost:3000/api
    description: 本地开发环境
  - url: https://api.example.com/api
    description: 生产环境

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Report:
      type: object
      properties:
        id:
          type: integer
        reportNumber:
          type: string
        reportType:
          type: string
          enum: [INSPECTION_CERT, INSTALLATION_INSPECTION]
        inspectionDate:
          type: string
          format: date
        equipmentName:
          type: string
        clientCompany:
          type: string
        userCompany:
          type: string
        fileUrl:
          type: string
        fileType:
          type: string
          enum: [PDF, JPG, PNG]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        details:
          type: object

paths:
  /health:
    get:
      summary: 健康检查
      tags: [System]
      responses:
        '200':
          description: 系统正常
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok

  /reports/{reportNumber}:
    get:
      summary: 查询报告（公开接口）
      tags: [Public]
      parameters:
        - name: reportNumber
          in: path
          required: true
          schema:
            type: string
          description: 报告编号
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Report'
        '404':
          description: 报告不存在
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /admin/login:
    post:
      summary: 管理员登录
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: 登录成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  username:
                    type: string
                  expiresIn:
                    type: integer
        '401':
          description: 用户名或密码错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /admin/upload:
    post:
      summary: 上传报告文件
      tags: [Admin]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '200':
          description: 上传成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  fileUrl:
                    type: string
                  fileType:
                    type: string
        '400':
          description: 文件验证失败
        '401':
          description: 未授权

  /admin/reports:
    get:
      summary: 获取报告列表
      tags: [Admin]
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Report'
                  total:
                    type: integer
                  page:
                    type: integer
                  limit:
                    type: integer

    post:
      summary: 创建报告记录
      tags: [Admin]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reportNumber, reportType, inspectionDate, equipmentName, clientCompany, userCompany, fileUrl, fileType]
              properties:
                reportNumber:
                  type: string
                reportType:
                  type: string
                  enum: [INSPECTION_CERT, INSTALLATION_INSPECTION]
                inspectionDate:
                  type: string
                  format: date
                equipmentName:
                  type: string
                clientCompany:
                  type: string
                userCompany:
                  type: string
                fileUrl:
                  type: string
                fileType:
                  type: string
                  enum: [PDF, JPG, PNG]
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Report'
        '409':
          description: 报告编号已存在

  /admin/reports/{id}:
    put:
      summary: 更新报告元数据
      tags: [Admin]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                reportType:
                  type: string
                inspectionDate:
                  type: string
                equipmentName:
                  type: string
                clientCompany:
                  type: string
                userCompany:
                  type: string
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Report'
        '404':
          description: 报告不存在

    delete:
      summary: 删除报告
      tags: [Admin]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: 删除成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
        '404':
          description: 报告不存在

  /admin/stats:
    get:
      summary: 获取统计数据
      tags: [Admin]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalReports:
                    type: integer
```

---

## Components

### Frontend Components

#### 1. Public Website App

**Responsibility:** 面向公众的官网前台，提供公司简介和报告查询功能。

**Key Interfaces:**
- 首页路由：`/`
- 报告详情路由：`/reports/:reportNumber`

**Dependencies:**
- 后端 API：`GET /api/reports/:reportNumber`
- Nginx：加载静态资源和文件

**Technology Stack:**
- React 18 + TypeScript
- React Router for SPA 路由
- Ant Design 组件库
- TailwindCSS 自定义样式
- Axios 进行 API 调用

---

#### 2. Admin Management App

**Responsibility:** 管理员后台，提供报告上传、编辑、删除和列表查看功能。

**Key Interfaces:**
- 登录路由：`/admin/login`
- 后台首页：`/admin`
- 报告列表：`/admin/reports`
- 上传报告：`/admin/upload`
- 编辑报告：`/admin/reports/:id/edit`

**Dependencies:**
- 后端 API：所有 `/api/admin/*` 接口
- JWT Token 存储：localStorage

**Technology Stack:**
- React 18 + TypeScript
- React Router + 受保护路由（AuthGuard）
- Ant Design 表格、表单组件
- Context API 管理认证状态

---

### Backend Components

#### 3. API Gateway / Router Layer

**Responsibility:** 接收 HTTP 请求，路由到对应的 Controller，应用中间件（CORS、认证、错误处理）。

**Key Interfaces:**
- Express Router
- 中间件管道

**Dependencies:**
- Controller Layer

**Technology Stack:**
- Express.js
- cors 中间件
- helmet 安全中间件
- JWT 认证中间件

---

#### 4. Controller Layer

**Responsibility:** 处理 HTTP 请求，验证输入，调用 Service Layer，返回 HTTP 响应。

**Key Interfaces:**
- `ReportController`: 处理报告相关请求
- `AdminController`: 处理管理员认证和管理请求
- `UploadController`: 处理文件上传

**Dependencies:**
- Service Layer

**Technology Stack:**
- Express Request/Response handlers
- express-validator 进行输入验证

---

#### 5. Service Layer

**Responsibility:** 实现业务逻辑，协调多个 Repository，处理事务和复杂操作。

**Key Interfaces:**
- `ReportService`: 报告业务逻辑
- `AdminService`: 管理员业务逻辑
- `FileService`: 文件上传下载业务逻辑

**Dependencies:**
- Repository Layer
- Multer (文件上传中间件)
- fs (Node.js 文件系统模块)

**Technology Stack:**
- TypeScript 类
- bcrypt 密码加密
- jsonwebtoken JWT 生成和验证

---

#### 6. Repository Layer

**Responsibility:** 封装数据库访问，提供统一的数据操作接口（CRUD）。

**Key Interfaces:**
- `ReportRepository`: 报告数据访问
- `AdminRepository`: 管理员数据访问

**Dependencies:**
- Prisma ORM
- PostgreSQL 数据库

**Technology Stack:**
- Prisma Client
- TypeScript 类

---

#### 7. Database (PostgreSQL + Prisma)

**Responsibility:** 持久化存储报告和管理员数据，保证 ACID 事务。

**Key Interfaces:**
- Prisma Schema 定义
- 数据库迁移

**Dependencies:**
- 无（底层基础设施）

**Technology Stack:**
- PostgreSQL 15+
- Prisma ORM

---

#### 8. File Storage (本地文件系统)

**Responsibility:** 存储报告文件（PDF、图片）到服务器本地目录。

**Key Interfaces:**
- Multer 中间件配置
- 文件路径生成和访问

**Dependencies:**
- 无（Node.js 原生模块）

**Technology Stack:**
- Multer (文件上传中间件)
- Node.js fs 模块
- 文件存储目录：`/var/www/checkReport/uploads` 或配置指定目录

---

### Component Diagrams

```mermaid
C4Component
  title Component Diagram - 检测报告查询系统

  Person(user, "公众用户", "查询报告")
  Person(admin, "管理员", "管理报告")

  Container_Boundary(web, "前端应用") {
    Component(publicApp, "Public Website", "React SPA", "官网和查询界面")
    Component(adminApp, "Admin App", "React SPA", "后台管理界面")
  }

  Container_Boundary(api, "后端 API") {
    Component(router, "API Router", "Express", "路由和中间件")
    Component(controller, "Controllers", "Express Handlers", "请求处理")
    Component(service, "Services", "Business Logic", "业务逻辑")
    Component(repo, "Repositories", "Data Access", "数据访问")
  }

  ContainerDb(db, "MySQL", "关系型数据库", "存储元数据")
  Container(fileSystem, "本地文件系统", "/uploads 目录", "存储报告文件")

  Rel(user, publicApp, "使用")
  Rel(admin, adminApp, "使用")
  Rel(publicApp, router, "API 调用", "HTTPS/JSON")
  Rel(adminApp, router, "API 调用", "HTTPS/JSON + JWT")
  Rel(router, controller, "路由")
  Rel(controller, service, "调用")
  Rel(service, repo, "调用")
  Rel(repo, db, "读写", "Prisma")
  Rel(service, fileSystem, "读写文件", "fs + Multer")
```

---

## External APIs

**无外部 API 依赖**

本系统不依赖外部 API 服务。所有功能均在本地服务器实现：
- 文件存储：本地文件系统
- 数据库：本地或自建 MySQL 实例
- 认证：JWT Token（无第三方认证服务）

---

## Core Workflows

### 报告查询工作流

```mermaid
sequenceDiagram
    actor User as 公众用户
    participant Browser as 浏览器
    participant API as 后端 API
    participant DB as MySQL
    participant FileSystem as 文件系统

    User->>Browser: 输入报告编号并查询
    Browser->>API: GET /api/reports/{reportNumber}
    API->>DB: 查询报告元数据
    alt 报告存在
        DB-->>API: 返回报告数据（含文件路径）
        API-->>Browser: 200 OK + 报告 JSON
        Browser->>API: 请求报告文件（GET /uploads/{filePath}）
        API->>FileSystem: 读取文件
        FileSystem-->>API: 返回文件内容
        API-->>Browser: 返回文件流
        Browser->>User: 显示报告详情和文件预览
    else 报告不存在
        DB-->>API: 无记录
        API-->>Browser: 404 Not Found
        Browser->>User: 显示"未找到该报告"
    end
```

### 报告上传工作流

```mermaid
sequenceDiagram
    actor Admin as 管理员
    participant Browser as 浏览器
    participant API as 后端 API
    participant FileSystem as 文件系统
    participant DB as MySQL

    Admin->>Browser: 填写报告信息并选择文件
    Browser->>API: POST /api/admin/reports (multipart/form-data)

    API->>API: 验证文件类型和大小（Multer）
    alt 文件验证通过
        API->>FileSystem: 保存文件到 /uploads 目录
        FileSystem-->>API: 返回文件路径
        API->>DB: 验证报告编号唯一性
        alt 编号唯一
            API->>DB: 插入报告记录（包含文件路径）
            DB-->>API: 返回新记录
            API-->>Browser: 201 Created + 报告 JSON
            Browser->>Admin: 显示"上传成功"
        else 编号重复
            API->>FileSystem: 删除已上传文件
            API-->>Browser: 409 Conflict
            Browser->>Admin: 显示"报告编号已存在"
        end
    else 文件验证失败
        API-->>Browser: 400 Bad Request
        Browser->>Admin: 显示错误信息
    end
```

### 管理员登录工作流

```mermaid
sequenceDiagram
    actor Admin as 管理员
    participant Browser as 浏览器
    participant API as 后端 API
    participant DB as MySQL

    Admin->>Browser: 输入用户名和密码
    Browser->>API: POST /api/admin/login
    API->>DB: 查询管理员账号
    DB-->>API: 返回账号数据（包含 passwordHash）
    API->>API: bcrypt 验证密码
    alt 密码正确
        API->>API: 生成 JWT Token
        API-->>Browser: 200 OK + {token, username}
        Browser->>Browser: 保存 Token 到 localStorage
        Browser->>Admin: 跳转到管理后台首页
    else 密码错误或账号不存在
        API-->>Browser: 401 Unauthorized
        Browser->>Admin: 显示"用户名或密码错误"
    end
```

---

## Database Schema

### Prisma Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 报告类型枚举
enum ReportType {
  INSPECTION_CERT           // 检测合格证
  INSTALLATION_INSPECTION   // 安装委托检验
}

// 文件类型枚举
enum FileType {
  PDF
  JPG
  PNG
}

// 报告表
model Report {
  id             Int         @id @default(autoincrement())
  reportNumber   String      @unique @map("report_number") @db.VarChar(50)
  reportType     ReportType  @map("report_type")
  inspectionDate DateTime    @map("inspection_date") @db.Date
  equipmentName  String      @map("equipment_name") @db.VarChar(200)
  clientCompany  String      @map("client_company") @db.VarChar(200)
  userCompany    String      @map("user_company") @db.VarChar(200)
  fileUrl        String      @map("file_url") @db.VarChar(500)
  fileType       FileType    @map("file_type")
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  @@index([reportNumber])
  @@index([createdAt])
  @@map("reports")
}

// 管理员表
model Admin {
  id           Int      @id @default(autoincrement())
  username     String   @unique @db.VarChar(50)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("admins")
}
```

### SQL Schema (Generated by Prisma)

```sql
-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INSPECTION_CERT', 'INSTALLATION_INSPECTION');
CREATE TYPE "FileType" AS ENUM ('PDF', 'JPG', 'PNG');

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "report_number" VARCHAR(50) NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "inspection_date" DATE NOT NULL,
    "equipment_name" VARCHAR(200) NOT NULL,
    "client_company" VARCHAR(200) NOT NULL,
    "user_company" VARCHAR(200) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_type" "FileType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reports_report_number_key" ON "reports"("report_number");
CREATE INDEX "reports_report_number_idx" ON "reports"("report_number");
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
```

---

## Frontend Architecture

### Component Architecture

#### Component Organization

```
apps/web/src/
├── components/              # 可复用组件
│   ├── common/              # 通用组件
│   │   ├── Header.tsx       # 页头
│   │   ├── Footer.tsx       # 页脚
│   │   ├── Loading.tsx      # 加载动画
│   │   └── ErrorMessage.tsx # 错误提示
│   ├── public/              # 公众页面组件
│   │   ├── CompanyIntro.tsx # 公司简介
│   │   ├── SearchBox.tsx    # 查询输入框
│   │   └── ReportDetail.tsx # 报告详情展示
│   └── admin/               # 管理后台组件
│       ├── LoginForm.tsx    # 登录表单
│       ├── ReportTable.tsx  # 报告列表表格
│       ├── ReportForm.tsx   # 报告上传/编辑表单
│       └── ProtectedRoute.tsx # 路由守卫
├── pages/                   # 页面组件
│   ├── HomePage.tsx         # 首页
│   ├── ReportDetailPage.tsx # 报告详情页
│   ├── admin/
│   │   ├── LoginPage.tsx    # 登录页
│   │   ├── DashboardPage.tsx # 后台首页
│   │   ├── ReportListPage.tsx # 报告列表页
│   │   ├── UploadPage.tsx   # 上传页
│   │   └── EditPage.tsx     # 编辑页
├── services/                # API 调用服务
│   ├── api.ts               # Axios 配置
│   ├── reportService.ts     # 报告相关 API
│   └── adminService.ts      # 管理员相关 API
├── hooks/                   # 自定义 Hooks
│   ├── useAuth.ts           # 认证状态 Hook
│   └── useReport.ts         # 报告查询 Hook
├── contexts/                # Context API
│   └── AuthContext.tsx      # 认证上下文
├── types/                   # 类型定义（从 shared 包导入）
├── utils/                   # 工具函数
│   ├── format.ts            # 日期格式化等
│   └── constants.ts         # 常量定义
├── styles/                  # 全局样式
│   └── globals.css          # Tailwind 基础样式
├── App.tsx                  # 应用根组件
└── main.tsx                 # 入口文件
```

#### Component Template

```typescript
// apps/web/src/components/public/SearchBox.tsx
import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface SearchBoxProps {
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ className }) => {
  const [reportNumber, setReportNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!reportNumber.trim()) {
      message.warning('请输入报告编号');
      return;
    }

    setLoading(true);
    try {
      // 直接导航到报告详情页，由详情页负责查询
      navigate(`/reports/${reportNumber.trim()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        size="large"
        placeholder="请输入报告编号"
        value={reportNumber}
        onChange={(e) => setReportNumber(e.target.value)}
        onKeyPress={handleKeyPress}
        prefix={<SearchOutlined />}
        className="flex-1"
      />
      <Button
        type="primary"
        size="large"
        icon={<SearchOutlined />}
        loading={loading}
        onClick={handleSearch}
      >
        查询
      </Button>
    </div>
  );
};
```

---

### State Management Architecture

#### State Structure

```typescript
// apps/web/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminPayload } from '@checkReport/shared';
import { adminService } from '../services/adminService';

interface AuthState {
  isAuthenticated: boolean;
  user: AdminPayload | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 初始化时从 localStorage 恢复认证状态
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await adminService.login({ username, password });
    const { token: newToken, username: userName } = response;

    // 解析 JWT 获取用户信息（简化版，生产环境应使用 jwt-decode）
    const payload = JSON.parse(atob(newToken.split('.')[1])) as AdminPayload;

    setToken(newToken);
    setUser(payload);
    setIsAuthenticated(true);

    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(payload));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### State Management Patterns
- **Authentication State:** 使用 Context API + localStorage 持久化
- **Form State:** 使用 Ant Design Form 内置状态管理
- **API Loading State:** 使用组件本地 useState
- **Server State Caching:** MVP 阶段不使用（未来可引入 React Query）

---

### Routing Architecture

#### Route Organization

```typescript
// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ReportDetailPage from './pages/ReportDetailPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ReportListPage from './pages/admin/ReportListPage';
import UploadPage from './pages/admin/UploadPage';
import EditPage from './pages/admin/EditPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 公众路由 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/reports/:reportNumber" element={<ReportDetailPage />} />

          {/* 管理员登录 */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* 受保护的管理员路由 */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="reports" element={<ReportListPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="reports/:id/edit" element={<EditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

#### Protected Route Pattern

```typescript
// apps/web/src/components/admin/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spin } from 'antd';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // 模拟 Token 验证（生产环境应验证 Token 有效性）
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};
```

---

### Frontend Services Layer

#### API Client Setup

```typescript
// apps/web/src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { message } from 'antd';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 创建 Axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/admin/login';
          break;
        case 404:
          // 404 由具体页面处理
          break;
        case 409:
          message.error((data as any)?.error || '操作冲突');
          break;
        case 500:
          message.error('服务器错误，请稍后重试');
          break;
        default:
          message.error((data as any)?.error || '请求失败');
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Service Example

```typescript
// apps/web/src/services/reportService.ts
import apiClient from './api';
import { Report, CreateReportDto, UpdateReportDto, ReportListQuery } from '@checkReport/shared';

export const reportService = {
  // 公开查询接口
  async getByReportNumber(reportNumber: string): Promise<Report> {
    const { data } = await apiClient.get<Report>(`/reports/${reportNumber}`);
    return data;
  },

  // 管理员接口
  async getList(query: ReportListQuery = {}): Promise<{ data: Report[]; total: number; page: number; limit: number }> {
    const { data } = await apiClient.get('/admin/reports', { params: query });
    return data;
  },

  async create(dto: CreateReportDto): Promise<Report> {
    const { data } = await apiClient.post<Report>('/admin/reports', dto);
    return data;
  },

  async update(id: number, dto: UpdateReportDto): Promise<Report> {
    const { data } = await apiClient.put<Report>(`/admin/reports/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/admin/reports/${id}`);
  },

  async uploadFile(file: File): Promise<{ fileUrl: string; fileType: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
```

---

## Backend Architecture

### Service Architecture

#### Controller/Route Organization

```
apps/api/src/
├── routes/                  # 路由定义
│   ├── index.ts             # 主路由聚合
│   ├── publicRoutes.ts      # 公开路由
│   └── adminRoutes.ts       # 管理员路由
├── controllers/             # 控制器
│   ├── reportController.ts  # 报告控制器
│   ├── adminController.ts   # 管理员控制器
│   └── uploadController.ts  # 文件上传控制器
├── services/                # 业务逻辑
│   ├── reportService.ts     # 报告服务
│   ├── adminService.ts      # 管理员服务
│   └── fileService.ts       # 文件服务
├── repositories/            # 数据访问
│   ├── reportRepository.ts  # 报告仓储
│   └── adminRepository.ts   # 管理员仓储
├── middleware/              # 中间件
│   ├── auth.ts              # JWT 认证中间件
│   ├── errorHandler.ts      # 错误处理中间件
│   └── validate.ts          # 输入验证中间件
├── utils/                   # 工具函数
│   ├── jwt.ts               # JWT 工具
│   ├── logger.ts            # 日志工具
│   └── config.ts            # 配置管理
├── types/                   # 类型定义
├── prisma/                  # Prisma 配置
│   └── schema.prisma        # 数据库模型
└── server.ts                # 服务器入口
```

#### Controller Template

```typescript
// apps/api/src/controllers/reportController.ts
import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/reportService';
import { CreateReportDto, UpdateReportDto } from '@checkReport/shared';

export const reportController = {
  // 公开查询报告
  async getByReportNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportNumber } = req.params;
      const report = await reportService.findByReportNumber(reportNumber);

      if (!report) {
        return res.status(404).json({
          error: '未找到该报告，请确认报告编号是否正确',
        });
      }

      res.json(report);
    } catch (error) {
      next(error);
    }
  },

  // 获取报告列表（管理员）
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const result = await reportService.findAll({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // 创建报告（管理员）
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CreateReportDto = req.body;
      const report = await reportService.create(dto);

      res.status(201).json(report);
    } catch (error) {
      // 处理唯一约束冲突
      if ((error as any).code === 'P2002') {
        return res.status(409).json({ error: '报告编号已存在' });
      }
      next(error);
    }
  },

  // 更新报告（管理员）
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dto: UpdateReportDto = req.body;

      const report = await reportService.update(Number(id), dto);
      if (!report) {
        return res.status(404).json({ error: '报告不存在' });
      }

      res.json(report);
    } catch (error) {
      next(error);
    }
  },

  // 删除报告（管理员）
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await reportService.delete(Number(id));

      if (!deleted) {
        return res.status(404).json({ error: '报告不存在' });
      }

      res.json({ message: '报告删除成功' });
    } catch (error) {
      next(error);
    }
  },
};
```

---

### Database Architecture

#### Schema Design

参考前面的 Prisma Schema Definition 部分。

#### Data Access Layer

```typescript
// apps/api/src/repositories/reportRepository.ts
import { PrismaClient, Report, Prisma } from '@prisma/client';
import { CreateReportDto, UpdateReportDto } from '@checkReport/shared';

const prisma = new PrismaClient();

export const reportRepository = {
  async findByReportNumber(reportNumber: string): Promise<Report | null> {
    return prisma.report.findUnique({
      where: { reportNumber },
    });
  },

  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.ReportWhereInput;
    orderBy?: Prisma.ReportOrderByWithRelationInput;
  }): Promise<{ reports: Report[]; total: number }> {
    const [reports, total] = await prisma.$transaction([
      prisma.report.findMany(params),
      prisma.report.count({ where: params.where }),
    ]);

    return { reports, total };
  },

  async create(data: CreateReportDto): Promise<Report> {
    return prisma.report.create({
      data: {
        reportNumber: data.reportNumber,
        reportType: data.reportType,
        inspectionDate: new Date(data.inspectionDate),
        equipmentName: data.equipmentName,
        clientCompany: data.clientCompany,
        userCompany: data.userCompany,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
      },
    });
  },

  async update(id: number, data: UpdateReportDto): Promise<Report | null> {
    try {
      return await prisma.report.update({
        where: { id },
        data: {
          ...(data.reportType && { reportType: data.reportType }),
          ...(data.inspectionDate && { inspectionDate: new Date(data.inspectionDate) }),
          ...(data.equipmentName && { equipmentName: data.equipmentName }),
          ...(data.clientCompany && { clientCompany: data.clientCompany }),
          ...(data.userCompany && { userCompany: data.userCompany }),
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return null; // 记录不存在
      }
      throw error;
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.report.delete({ where: { id } });
      return true;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return false; // 记录不存在
      }
      throw error;
    }
  },

  async count(): Promise<number> {
    return prisma.report.count();
  },
};
```

---

### Authentication and Authorization

#### Auth Flow

```mermaid
sequenceDiagram
    participant Client as 前端
    participant API as 后端 API
    participant DB as PostgreSQL

    Client->>API: POST /api/admin/login<br/>{username, password}
    API->>DB: 查询管理员
    DB-->>API: 返回账号（含 passwordHash）
    API->>API: bcrypt.compare(password, passwordHash)
    alt 密码正确
        API->>API: jwt.sign({id, username}, SECRET)
        API-->>Client: 200 OK<br/>{token, username, expiresIn}
        Note over Client: 保存 Token 到 localStorage
        Client->>API: GET /api/admin/reports<br/>Authorization: Bearer {token}
        API->>API: 验证 JWT Token
        alt Token 有效
            API->>DB: 查询报告列表
            DB-->>API: 返回数据
            API-->>Client: 200 OK + 数据
        else Token 无效/过期
            API-->>Client: 401 Unauthorized
        end
    else 密码错误
        API-->>Client: 401 Unauthorized
    end
```

#### Middleware/Guards

```typescript
// apps/api/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminPayload } from '@checkReport/shared';
import { config } from '../utils/config';

// 扩展 Request 类型，添加 user 属性
declare global {
  namespace Express {
    interface Request {
      user?: AdminPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权：缺少认证令牌' });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    const payload = jwt.verify(token, config.jwtSecret) as AdminPayload;
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: '未授权：令牌无效' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: '未授权：令牌已过期' });
    }

    next(error);
  }
};
```

---

## Unified Project Structure

```plaintext
checkReport/
├── .github/                          # CI/CD workflows
│   └── workflows/
│       ├── ci.yml                    # 持续集成
│       └── deploy.yml                # 部署流程
├── apps/                             # 应用层
│   ├── web/                          # 前端应用
│   │   ├── src/
│   │   │   ├── components/           # UI 组件
│   │   │   │   ├── common/
│   │   │   │   ├── public/
│   │   │   │   └── admin/
│   │   │   ├── pages/                # 页面组件
│   │   │   ├── services/             # API 客户端
│   │   │   ├── hooks/                # 自定义 Hooks
│   │   │   ├── contexts/             # Context API
│   │   │   ├── types/                # 类型定义
│   │   │   ├── utils/                # 工具函数
│   │   │   ├── styles/               # 全局样式
│   │   │   ├── App.tsx               # 根组件
│   │   │   └── main.tsx              # 入口文件
│   │   ├── public/                   # 静态资源
│   │   ├── index.html                # HTML 模板
│   │   ├── vite.config.ts            # Vite 配置
│   │   ├── tailwind.config.js        # TailwindCSS 配置
│   │   ├── tsconfig.json             # TypeScript 配置
│   │   └── package.json
│   └── api/                          # 后端应用
│       ├── src/
│       │   ├── routes/               # 路由定义
│       │   ├── controllers/          # 控制器
│       │   ├── services/             # 业务逻辑
│       │   ├── repositories/         # 数据访问
│       │   ├── middleware/           # 中间件
│       │   ├── utils/                # 工具函数
│       │   ├── types/                # 类型定义
│       │   └── server.ts             # 服务器入口
│       ├── prisma/                   # Prisma 配置
│       │   ├── schema.prisma         # 数据库模型
│       │   ├── migrations/           # 数据库迁移
│       │   └── seed.ts               # 数据库种子
│       ├── tests/                    # 测试文件
│       ├── tsconfig.json
│       └── package.json
├── packages/                         # 共享包
│   ├── shared/                       # 共享类型和工具
│   │   ├── src/
│   │   │   ├── types/                # TypeScript 接口
│   │   │   │   ├── report.ts
│   │   │   │   ├── admin.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/            # 常量定义
│   │   │   └── utils/                # 共享工具函数
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── config/                       # 共享配置
│       ├── eslint/
│       │   └── .eslintrc.js
│       ├── typescript/
│       │   └── tsconfig.base.json
│       └── prettier/
│           └── .prettierrc.js
├── docs/                             # 文档
│   ├── prd.md                        # 产品需求文档
│   ├── brief.md                      # 项目简介
│   └── architecture.md               # 架构文档（本文件）
├── scripts/                          # 构建和部署脚本
│   ├── deploy-frontend.sh            # 前端部署脚本
│   └── deploy-backend.sh             # 后端部署脚本
├── .env.example                      # 环境变量模板
├── .gitignore                        # Git 忽略文件
├── pnpm-workspace.yaml               # pnpm workspace 配置
├── package.json                      # 根 package.json
├── tsconfig.json                     # 根 TypeScript 配置
└── README.md                         # 项目说明
```

---

## Development Workflow

### Local Development Setup

#### Prerequisites

```bash
# 安装 Node.js 18+ 和 pnpm
node --version  # 确保 >= 18.0.0
pnpm --version  # 确保 >= 8.0.0

# 安装 MySQL 8.0+
mysql --version

# 创建上传文件目录
mkdir -p /var/www/checkReport/uploads
```

#### Initial Setup

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

#### Development Commands

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

### Environment Configuration

#### Required Environment Variables

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

## Deployment Architecture

### Deployment Strategy

**前端部署：**
- **平台：** Nginx 静态文件服务器
- **构建命令：** `pnpm --filter web build`
- **输出目录：** `apps/web/dist`
- **部署路径：** `/var/www/checkReport/dist`
- **HTTPS：** 使用 Let's Encrypt 免费证书或自签名证书

**后端部署：**
- **平台：** Linux 服务器（推荐 Ubuntu 20.04+）
- **构建命令：** `pnpm --filter api build`
- **部署方式：** PM2 进程管理，Nginx 反向代理
- **数据库：** 本地 MySQL 8.0+ 或远程 MySQL 实例
- **文件存储：** `/var/www/checkReport/uploads` 目录

---

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: checkReport_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Test Frontend
        run: pnpm --filter web test

      - name: Test Backend
        run: |
          cd apps/api
          pnpm prisma migrate deploy
          pnpm test
        env:
          DATABASE_URL: mysql://root:test@localhost:3306/checkReport_test

      - name: Build
        run: pnpm build
```

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install and Build
        run: |
          pnpm install
          pnpm build

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/checkReport
            git pull origin main
            pnpm install
            pnpm build

            # 部署前端
            rm -rf /var/www/checkReport/dist
            cp -r apps/web/dist /var/www/checkReport/

            # 部署后端
            cd apps/api
            pnpm prisma migrate deploy
            pm2 restart checkReport-api

            # 重启 Nginx
            sudo nginx -t && sudo systemctl reload nginx
```

---

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:5173 | http://localhost:3000 | 本地开发环境 |
| Production | https://www.your-domain.com | https://www.your-domain.com/api | 生产环境（Nginx 统一入口） |

**说明：** 生产环境使用 Nginx 统一处理前后端请求，前端静态文件和后端 API 共享同一域名，简化 CORS 配置。

---

## Security and Performance

### Security Requirements

**前端安全：**
- **CSP Headers:** `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.example.com;`
- **XSS Prevention:** React 默认转义输出，避免使用 `dangerouslySetInnerHTML`
- **Secure Storage:** Token 存储在 localStorage（MVP 阶段），生产环境可升级为 HttpOnly Cookie

**后端安全：**
- **Input Validation:** 使用 `express-validator` 验证所有输入，防止注入攻击
- **Rate Limiting:** 使用 `express-rate-limit` 限制 API 请求频率（登录接口 5 次/分钟，其他接口 100 次/分钟）
- **CORS Policy:** `cors({ origin: ['https://www.example.com', 'https://staging.example.com'], credentials: true })`

**认证安全：**
- **Token Storage:** JWT Token，有效期 7 天，客户端存储在 localStorage
- **Session Management:** 无状态认证，Token 过期后需重新登录
- **Password Policy:** 最少 8 位，包含大小写字母和数字，使用 bcrypt 加密（salt rounds: 10）
- **File Access Control:** 文件访问需要经过后端验证，防止直接访问上传目录

---

### Performance Optimization

**前端性能：**
- **Bundle Size Target:** 初始加载 < 200KB（gzip 压缩后）
- **Loading Strategy:** 代码分割（React.lazy），路由级别懒加载
- **Caching Strategy:** Nginx 配置静态资源缓存，浏览器缓存策略
- **图片优化：** 使用合适的图片格式和压缩，懒加载非首屏图片

**后端性能：**
- **Response Time Target:** P95 < 200ms（数据库查询优化）
- **Database Optimization:**
  - 报告编号添加唯一索引
  - 创建时间添加普通索引（用于排序和分页）
  - 定期清理过期数据
- **Caching Strategy:** 使用内存缓存报告查询结果（TTL 5 分钟），减少数据库压力
- **File Serving:**
  - 使用 Nginx 直接提供文件服务，避免 Node.js 处理静态文件
  - 配置 sendfile 和 gzip 压缩
  - 设置合理的缓存头

---

## Testing Strategy

### Testing Pyramid

```
         E2E Tests (Playwright)
        /                      \
       /  Integration Tests     \
      /   (API + Database)       \
     /                            \
    Frontend Unit    Backend Unit
   (Vitest + RTL)  (Jest + Supertest)
```

### Test Organization

#### Frontend Tests

```
apps/web/tests/
├── unit/                    # 单元测试
│   ├── components/
│   │   ├── SearchBox.test.tsx
│   │   └── ReportTable.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   └── services/
│       └── reportService.test.ts
└── e2e/                     # E2E 测试
    ├── public.spec.ts       # 公众查询流程
    └── admin.spec.ts        # 管理员操作流程
```

#### Backend Tests

```
apps/api/tests/
├── unit/                    # 单元测试
│   ├── services/
│   │   ├── reportService.test.ts
│   │   └── adminService.test.ts
│   └── utils/
│       └── jwt.test.ts
└── integration/             # 集成测试
    ├── report.api.test.ts   # 报告 API 测试
    └── admin.api.test.ts    # 管理员 API 测试
```

---

### Test Examples

#### Frontend Component Test

```typescript
// apps/web/tests/unit/components/SearchBox.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SearchBox } from '../../../src/components/public/SearchBox';
import { describe, it, expect, vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SearchBox', () => {
  it('should render search input and button', () => {
    render(
      <BrowserRouter>
        <SearchBox />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('请输入报告编号')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /查询/i })).toBeInTheDocument();
  });

  it('should navigate to report detail when search is clicked', () => {
    render(
      <BrowserRouter>
        <SearchBox />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('请输入报告编号');
    const button = screen.getByRole('button', { name: /查询/i });

    fireEvent.change(input, { target: { value: 'ZJW20230145' } });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/reports/ZJW20230145');
  });

  it('should show warning when search with empty input', async () => {
    render(
      <BrowserRouter>
        <SearchBox />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /查询/i });
    fireEvent.click(button);

    // Ant Design message 测试需要额外配置
    // 这里简化处理
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
```

#### Backend API Test

```typescript
// apps/api/tests/integration/report.api.test.ts
import request from 'supertest';
import { app } from '../../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Report API', () => {
  beforeAll(async () => {
    // 清空测试数据库
    await prisma.report.deleteMany();

    // 插入测试数据
    await prisma.report.create({
      data: {
        reportNumber: 'TEST001',
        reportType: 'INSPECTION_CERT',
        inspectionDate: new Date('2023-04-12'),
        equipmentName: '测试设备',
        clientCompany: '测试公司A',
        userCompany: '测试公司B',
        fileUrl: 'https://example.com/test.pdf',
        fileType: 'PDF',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/reports/:reportNumber', () => {
    it('should return report when it exists', async () => {
      const res = await request(app)
        .get('/api/reports/TEST001')
        .expect(200);

      expect(res.body).toHaveProperty('reportNumber', 'TEST001');
      expect(res.body).toHaveProperty('equipmentName', '测试设备');
    });

    it('should return 404 when report does not exist', async () => {
      const res = await request(app)
        .get('/api/reports/NOTEXIST')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/admin/reports', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 生成有效的测试 Token

    it('should create report when authorized', async () => {
      const newReport = {
        reportNumber: 'TEST002',
        reportType: 'INSTALLATION_INSPECTION',
        inspectionDate: '2023-05-01',
        equipmentName: '新设备',
        clientCompany: '公司C',
        userCompany: '公司D',
        fileUrl: 'https://example.com/test2.pdf',
        fileType: 'PDF',
      };

      const res = await request(app)
        .post('/api/admin/reports')
        .set('Authorization', `Bearer ${validToken}`)
        .send(newReport)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('reportNumber', 'TEST002');
    });

    it('should return 401 when not authorized', async () => {
      await request(app)
        .post('/api/admin/reports')
        .send({ reportNumber: 'TEST003' })
        .expect(401);
    });

    it('should return 409 when report number already exists', async () => {
      const duplicateReport = {
        reportNumber: 'TEST001', // 已存在
        reportType: 'INSPECTION_CERT',
        inspectionDate: '2023-06-01',
        equipmentName: '设备',
        clientCompany: '公司',
        userCompany: '公司',
        fileUrl: 'https://example.com/test.pdf',
        fileType: 'PDF',
      };

      await request(app)
        .post('/api/admin/reports')
        .set('Authorization', `Bearer ${validToken}`)
        .send(duplicateReport)
        .expect(409);
    });
  });
});
```

#### E2E Test

```typescript
// apps/web/tests/e2e/public.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Public Report Query', () => {
  test('should query and view report successfully', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:5173');

    // 验证页面标题和查询框
    await expect(page.locator('h1')).toContainText('浙江省牛叉检测技术有限公司');
    await expect(page.locator('input[placeholder="请输入报告编号"]')).toBeVisible();

    // 输入报告编号并查询
    await page.fill('input[placeholder="请输入报告编号"]', 'TEST001');
    await page.click('button:has-text("查询")');

    // 等待跳转到报告详情页
    await page.waitForURL('**/reports/TEST001');

    // 验证报告信息显示
    await expect(page.locator('text=报告编号')).toBeVisible();
    await expect(page.locator('text=TEST001')).toBeVisible();
    await expect(page.locator('text=测试设备')).toBeVisible();

    // 验证下载按钮存在
    await expect(page.locator('button:has-text("下载报告")')).toBeVisible();
  });

  test('should show error when report not found', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.fill('input[placeholder="请输入报告编号"]', 'NOTEXIST');
    await page.click('button:has-text("查询")');

    await page.waitForURL('**/reports/NOTEXIST');

    // 验证错误提示
    await expect(page.locator('text=未找到该报告')).toBeVisible();
  });
});
```

---

## Coding Standards

### Critical Fullstack Rules

- **类型共享：** 所有接口类型定义必须放在 `packages/shared/src/types/` 中，前后端统一导入，禁止重复定义
- **API 调用：** 前端禁止直接使用 axios，必须通过 `services/` 层的封装方法调用 API
- **环境变量：** 禁止直接使用 `process.env` 或 `import.meta.env`，必须通过 `utils/config.ts` 统一访问
- **错误处理：** 所有 API 路由必须使用统一的错误处理中间件，禁止在 Controller 中直接返回错误
- **数据库访问：** 禁止在 Service 层直接使用 Prisma Client，必须通过 Repository 层访问
- **密码处理：** 禁止明文存储或传输密码，必须使用 bcrypt 加密（salt rounds >= 10）
- **Token 验证：** 所有管理员路由必须添加 `authMiddleware` 中间件，禁止跳过认证
- **文件上传：** 文件上传必须验证类型和大小，禁止直接接受任意文件

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `UserProfile.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| Services | camelCase | camelCase | `reportService.ts` |
| Controllers | - | camelCase | `reportController.ts` |
| API Routes | - | kebab-case | `/api/user-profile` |
| Database Tables | - | snake_case | `user_profiles` |
| Type Interfaces | PascalCase | PascalCase | `CreateReportDto` |
| Constants | UPPER_SNAKE_CASE | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |

---

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant Client as 前端
    participant API as 后端 API
    participant Handler as Error Handler

    Client->>API: API 请求
    API->>API: 业务逻辑处理
    alt 处理成功
        API-->>Client: 200/201 + 数据
    else 业务错误
        API->>API: throw new Error()
        API->>Handler: next(error)
        Handler->>Handler: 格式化错误
        Handler-->>Client: 4xx/5xx + 错误 JSON
        Client->>Client: 显示错误提示
    end
```

### Frontend Error Handling

```typescript
// apps/web/src/services/api.ts (响应拦截器部分)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = (data as any)?.error || '请求失败';

      // 根据状态码显示不同的错误提示
      switch (status) {
        case 400:
          message.error(`请求错误：${errorMessage}`);
          break;
        case 401:
          message.error('登录已过期，请重新登录');
          // 清除认证信息并跳转登录页
          localStorage.removeItem('auth_token');
          window.location.href = '/admin/login';
          break;
        case 404:
          // 404 由页面组件处理，不全局提示
          break;
        case 409:
          message.error(`操作冲突：${errorMessage}`);
          break;
        case 500:
          message.error('服务器错误，请稍后重试');
          break;
        default:
          message.error(errorMessage);
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络');
    }

    return Promise.reject(error);
  }
);
```

### Backend Error Handling

```typescript
// apps/api/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = uuidv4();

  // 记录错误日志
  logger.error({
    requestId,
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
  });

  // 确定状态码
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let errorMessage = '服务器内部错误';

  // 处理已知错误类型
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    errorMessage = '未授权访问';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    errorMessage = err.message;
  } else if ((err as any).code === 'P2002') {
    // Prisma 唯一约束冲突
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    errorMessage = '数据已存在';
  }

  // 构造标准错误响应
  const errorResponse: ApiError = {
    error: {
      code: errorCode,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      originalMessage: err.message,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(errorResponse);
};
```

---

## Nginx Configuration Example

### Nginx 配置示例

```nginx
# /etc/nginx/sites-available/checkReport
server {
    listen 80;
    server_name www.your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.your-domain.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志配置
    access_log /var/log/nginx/checkReport-access.log;
    error_log /var/log/nginx/checkReport-error.log;

    # 前端静态文件
    location / {
        root /var/www/checkReport/dist;
        try_files $uri $uri/ /index.html;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件访问（通过后端验证）
    location /uploads/ {
        alias /var/www/checkReport/uploads/;

        # 安全配置：仅允许特定文件类型
        location ~* \.(pdf|jpg|jpeg|png)$ {
            add_header X-Content-Type-Options nosniff;
            add_header Content-Disposition inline;
        }

        # 拒绝其他文件类型
        location ~ {
            return 403;
        }
    }

    # 文件上传大小限制
    client_max_body_size 10M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

### PM2 配置示例

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'checkReport-api',
    script: './apps/api/dist/server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/api-error.log',
    out_file: './logs/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
};
```

---

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** 浏览器开发者工具 + 自定义性能监控（可选）
- **Backend Monitoring:** PM2 进程监控 + 系统资源监控（CPU、内存、磁盘）
- **Error Tracking:** Winston 日志文件 + PM2 日志管理
- **Performance Monitoring:** 自定义性能指标，记录 API 响应时间
- **Database Monitoring:** MySQL 慢查询日志分析

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals（LCP、FID、CLS）
- JavaScript 错误率和错误类型
- API 请求成功率和响应时间
- 用户操作流程（查询、上传等）

**Backend Metrics:**
- 请求速率（RPM）
- 错误率（5xx/4xx 占比）
- P50/P95/P99 响应时间
- 数据库查询性能（慢查询日志）

---

## Checklist Results Report

**待执行：** 在完成架构设计后，执行 Architect Checklist 任务，验证架构的完整性和合理性。结果将在此处更新。

---

**文档状态：** 初稿完成，待审阅和 Checklist 验证
**下一步负责人：** PO（产品负责人）进行文档验证，或 Scrum Master 开始创建 Story

---

**重要提示：** 本架构文档是整个项目的技术基础，所有开发工作必须严格遵循此文档。如需调整架构，必须更新本文档并通知所有团队成员。

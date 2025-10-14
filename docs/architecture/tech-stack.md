# Tech Stack

## Technology Stack Table

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

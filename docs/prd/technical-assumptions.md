# Technical Assumptions

## Repository Structure

**Monorepo（推荐）：** 前后端代码统一管理在一个仓库中，适合小团队协作。可使用工具如 Turborepo、Nx 或简单的目录结构（如 `apps/frontend`、`apps/backend`）。

**备选方案 - Polyrepo：** 如果团队希望前后端独立部署和版本管理，可采用两个独立仓库（frontend-repo、backend-repo）。

**决策理由：** 考虑到团队规模小（1-2 名开发者），Monorepo 可简化依赖管理和代码共享，降低维护成本。

## Service Architecture

**单体架构（Monolith）：** MVP 阶段采用单体架构，前后端分离但作为一个整体部署。后端提供 RESTful API，前端通过 API 调用获取数据。

**服务职责划分：**
- **前端服务：** 静态资源托管，页面渲染
- **后端服务：** API 接口，业务逻辑，数据库操作
- **文件存储服务：** 云对象存储（OSS），独立于应用服务器

**扩展性考虑：** 预留微服务拆分空间。未来如果需要自动生成报告功能，可将其拆分为独立的报告生成服务。

## Testing Requirements

**分层测试策略：**

1. **单元测试（必须）：** 覆盖后端核心业务逻辑（如报告查询、上传验证）和前端关键组件
2. **集成测试（推荐）：** 测试 API 端点和数据库交互，确保前后端集成正常
3. **端到端测试（可选）：** 使用 Playwright 或 Cypress 测试关键用户流程（如查询报告、上传报告）
4. **手动测试：** 开发环境提供便捷的手动测试工具（如 Swagger UI for API、本地测试数据）

**测试覆盖率目标：** 核心业务逻辑单元测试覆盖率 ≥ 70%

## Additional Technical Assumptions and Requests

**技术栈建议：**

- **前端：** React 18+ 或 Vue 3+，配合 TailwindCSS 或 Ant Design 组件库
- **后端：** Node.js (Express 或 Nest.js) 或 Python (FastAPI)
- **数据库：** PostgreSQL（推荐）或 MySQL，支持关系型数据存储
- **文件存储：** 阿里云 OSS 或腾讯云 COS
- **身份认证：** JWT Token，bcrypt 加密密码
- **部署：** Docker 容器化，云服务器（阿里云 ECS 或腾讯云 CVM）
- **CI/CD：** GitHub Actions 或 GitLab CI（可选，简化部署流程）

**环境配置：**
- 支持本地开发环境（localhost + 本地数据库）
- 支持线上生产环境（云服务器 + 云数据库 + OSS）
- 使用环境变量管理配置（数据库连接、OSS 密钥等）

**其他技术要求：**
- 后端 API 必须提供清晰的文档（建议使用 Swagger/OpenAPI）
- 前端必须实现良好的错误处理和 Loading 状态
- 管理员密码存储必须使用哈希加密，禁止明文存储
- 文件上传必须进行类型和大小验证（防止恶意文件）

---

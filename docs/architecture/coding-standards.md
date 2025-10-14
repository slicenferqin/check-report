# Coding Standards

## Critical Fullstack Rules

- **类型共享：** 所有接口类型定义必须放在 `packages/shared/src/types/` 中，前后端统一导入，禁止重复定义
- **API 调用：** 前端禁止直接使用 axios，必须通过 `services/` 层的封装方法调用 API
- **环境变量：** 禁止直接使用 `process.env` 或 `import.meta.env`，必须通过 `utils/config.ts` 统一访问
- **错误处理：** 所有 API 路由必须使用统一的错误处理中间件，禁止在 Controller 中直接返回错误
- **数据库访问：** 禁止在 Service 层直接使用 Prisma Client，必须通过 Repository 层访问
- **密码处理：** 禁止明文存储或传输密码，必须使用 bcrypt 加密（salt rounds >= 10）
- **Token 验证：** 所有管理员路由必须添加 `authMiddleware` 中间件，禁止跳过认证
- **文件上传：** 文件上传必须验证类型和大小，禁止直接接受任意文件

## Naming Conventions

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

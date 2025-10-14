# Story 1.4: 报告上传 API 开发（元数据部分）

**Epic:** Epic 1 - 项目基础设施与核心数据模型

**优先级:** P1

**状态:** TODO

**依赖:** Story 1.3 完成，需要先实现认证中间件

---

## 用户故事

作为一名**后端开发工程师**，
我想**开发报告元数据创建的 API 接口**，
以便**管理员能够添加新的报告记录**。

---

## Acceptance Criteria

1. ✅ 实现 `POST /api/admin/reports` 接口，接收报告元数据（JSON 格式）
2. ✅ 接口必须包含身份认证中间件，验证请求中的 JWT Token
3. ✅ 接收的字段包括：`report_number`、`report_type`、`inspection_date`、`equipment_name`、`client_company`、`user_company`、`file_url`、`file_type`
4. ✅ 验证所有必填字段不能为空，报告编号必须唯一（不能重复）
5. ✅ 验证报告类型和文件类型必须为枚举值中的一个
6. ✅ 数据验证通过后，将报告信息保存到数据库，返回 201 状态码和新创建的报告 JSON
7. ✅ 报告编号重复时，返回 409 状态码和错误信息 `{ "error": "报告编号已存在" }`
8. ✅ 数据验证失败时，返回 400 状态码和具体的验证错误信息
9. ✅ 编写单元测试，覆盖成功创建、编号重复、字段缺失等场景
10. ✅ 更新 API 文档，说明接口的认证方式和请求/响应格式

**注意：** 此 Story 仅处理元数据，文件上传将在 Story 1.5 中实现。

---

## 技术要点

### API 规格
```
POST /api/admin/reports
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

【请求体】
{
  "reportNumber": "ZJW20230145",
  "reportType": "INSPECTION_CERT",
  "inspectionDate": "2023-04-12",
  "equipmentName": "挖掘机 XE60DA",
  "clientCompany": "杭州建设工程有限公司",
  "userCompany": "浙江建工集团",
  "fileUrl": "reports/2023/04/ZJW20230145.pdf",
  "fileType": "PDF"
}

【响应格式】
成功 (201):
{
  "id": 1,
  "reportNumber": "ZJW20230145",
  "reportType": "INSPECTION_CERT",
  "inspectionDate": "2023-04-12",
  "equipmentName": "挖掘机 XE60DA",
  "clientCompany": "杭州建设工程有限公司",
  "userCompany": "浙江建工集团",
  "fileUrl": "reports/2023/04/ZJW20230145.pdf",
  "fileType": "PDF",
  "createdAt": "2023-04-12T10:00:00.000Z",
  "updatedAt": "2023-04-12T10:00:00.000Z"
}

编号重复 (409):
{
  "error": "报告编号已存在"
}

验证失败 (400):
{
  "error": "字段验证失败",
  "details": [
    "reportNumber 不能为空",
    "reportType 必须是 INSPECTION_CERT 或 INSTALLATION_INSPECTION"
  ]
}

未授权 (401):
{
  "error": "未授权,请先登录"
}
```

### 实现示例
```typescript
// apps/api/src/routes/admin.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// 验证 schema
const createReportSchema = z.object({
  reportNumber: z.string().min(1, '报告编号不能为空'),
  reportType: z.enum(['INSPECTION_CERT', 'INSTALLATION_INSPECTION']),
  inspectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  equipmentName: z.string().min(1),
  clientCompany: z.string().min(1),
  userCompany: z.string().min(1),
  fileUrl: z.string().min(1),
  fileType: z.enum(['PDF', 'JPG', 'PNG'])
})

router.post('/admin/reports', authMiddleware, async (req, res) => {
  try {
    // 验证输入
    const result = createReportSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: '字段验证失败',
        details: result.error.errors.map(e => e.message)
      })
    }

    // 检查编号是否已存在
    const existing = await prisma.report.findUnique({
      where: { reportNumber: result.data.reportNumber }
    })
    if (existing) {
      return res.status(409).json({ error: '报告编号已存在' })
    }

    // 创建报告
    const report = await prisma.report.create({
      data: {
        reportNumber: result.data.reportNumber,
        reportType: result.data.reportType,
        inspectionDate: new Date(result.data.inspectionDate),
        equipmentName: result.data.equipmentName,
        clientCompany: result.data.clientCompany,
        userCompany: result.data.userCompany,
        fileUrl: result.data.fileUrl,
        fileType: result.data.fileType
      }
    })

    res.status(201).json(report)
  } catch (error) {
    console.error('创建报告失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
```

---

## 任务拆解

- [ ] 实现 JWT 认证中间件 (`src/middleware/auth.ts`)
- [ ] 创建 `src/routes/admin.ts` 路由文件
- [ ] 安装验证库 (`zod`)
- [ ] 实现 `POST /admin/reports` 接口
  - [ ] 字段验证
  - [ ] 编号重复检查
  - [ ] 数据库创建操作
  - [ ] 错误处理
- [ ] 在主应用中注册路由
- [ ] 编写单元测试
- [ ] 手动测试（Postman/cURL）
- [ ] 更新 API 文档

---

## 验收测试

### 准备 JWT Token
首先需要实现登录接口获取 Token，或临时生成一个测试 Token。

### cURL 测试

**成功创建:**
```bash
curl -X POST http://localhost:3000/api/admin/reports \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "reportNumber": "ZJW20230146",
    "reportType": "INSPECTION_CERT",
    "inspectionDate": "2023-04-15",
    "equipmentName": "压路机 YL-200",
    "clientCompany": "杭州建设公司",
    "userCompany": "杭州工程公司",
    "fileUrl": "reports/2023/04/ZJW20230146.pdf",
    "fileType": "PDF"
  }'
# 应该返回 201 和新创建的报告
```

**编号重复:**
```bash
# 再次执行上面的命令
# 应该返回 409 和错误信息
```

**字段缺失:**
```bash
curl -X POST http://localhost:3000/api/admin/reports \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"reportNumber": "ZJW20230147"}'
# 应该返回 400 和验证错误
```

**未授权:**
```bash
curl -X POST http://localhost:3000/api/admin/reports \
  -H "Content-Type: application/json" \
  -d '{...}'
# 应该返回 401 未授权
```

---

## 参考文档

- [api-design.md](../api-design.md) - API 设计文档
- [Zod Documentation](https://zod.dev) - 数据验证库
- [JWT.io](https://jwt.io) - JWT 工具和文档

# Story 1.3: 报告查询 API 开发

**Epic:** Epic 1 - 项目基础设施与核心数据模型

**优先级:** P0

**状态:** TODO

**依赖:** Story 1.2 完成

---

## 用户故事

作为一名**后端开发工程师**，
我想**开发报告查询的 RESTful API 接口**，
以便**前端能够根据报告编号获取报告详情**。

---

## Acceptance Criteria

1. ✅ 实现 `GET /api/reports/:reportNumber` 接口，根据报告编号查询报告
2. ✅ 查询成功时，返回 200 状态码和报告详情 JSON（包含所有字段）
3. ✅ 报告不存在时，返回 404 状态码和错误信息 `{ "error": "未找到该报告,请确认报告编号是否正确" }`
4. ✅ 实现输入验证，报告编号不能为空，否则返回 400 状态码
5. ✅ 实现错误处理，数据库查询失败时返回 500 状态码和通用错误信息
6. ✅ 编写单元测试，覆盖成功查询、报告不存在、输入无效等场景
7. ✅ 使用 Postman 或 cURL 测试 API 端点，确保返回数据格式正确
8. ✅ 更新 API 文档，说明接口的请求和响应格式

---

## 技术要点

### API 规格
```
GET /api/reports/:reportNumber

【请求参数】
- reportNumber (string, path参数): 报告编号，如 "ZJW20230145"

【响应格式】
成功 (200):
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

失败 (404):
{
  "error": "未找到该报告,请确认报告编号是否正确"
}

参数无效 (400):
{
  "error": "报告编号不能为空"
}

服务器错误 (500):
{
  "error": "服务器内部错误,请稍后重试"
}
```

### 实现示例
```typescript
// apps/api/src/routes/reports.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/reports/:reportNumber', async (req, res) => {
  try {
    const { reportNumber } = req.params

    // 输入验证
    if (!reportNumber || reportNumber.trim() === '') {
      return res.status(400).json({ error: '报告编号不能为空' })
    }

    // 查询报告
    const report = await prisma.report.findUnique({
      where: { reportNumber }
    })

    if (!report) {
      return res.status(404).json({
        error: '未找到该报告,请确认报告编号是否正确'
      })
    }

    res.status(200).json(report)
  } catch (error) {
    console.error('报告查询失败:', error)
    res.status(500).json({ error: '服务器内部错误,请稍后重试' })
  }
})

export default router
```

---

## 任务拆解

- [ ] 创建 `apps/api/src/routes/reports.ts` 路由文件
- [ ] 实现 `GET /reports/:reportNumber` 接口
  - [ ] 输入验证
  - [ ] 数据库查询
  - [ ] 错误处理
- [ ] 在主应用中注册路由 (`app.use('/api', reportsRouter)`)
- [ ] 编写单元测试
  - [ ] 测试成功查询
  - [ ] 测试报告不存在
  - [ ] 测试参数为空
  - [ ] 测试数据库错误
- [ ] 手动测试（Postman/cURL）
- [ ] 更新 API 文档

---

## 验收测试

### 准备测试数据
```bash
# 使用 Prisma Studio 手动添加一条测试报告
pnpm prisma studio
```

或执行 SQL:
```sql
INSERT INTO reports (
  report_number, report_type, inspection_date,
  equipment_name, client_company, user_company,
  file_url, file_type
) VALUES (
  'ZJW20230145', 'INSPECTION_CERT', '2023-04-12',
  '挖掘机 XE60DA', '杭州建设工程有限公司', '浙江建工集团',
  'reports/2023/04/ZJW20230145.pdf', 'PDF'
);
```

### cURL 测试

**成功查询:**
```bash
curl http://localhost:3000/api/reports/ZJW20230145
# 应该返回 200 和报告详情
```

**报告不存在:**
```bash
curl http://localhost:3000/api/reports/NONEXIST
# 应该返回 404 和错误信息
```

**参数为空:**
```bash
curl http://localhost:3000/api/reports/%20
# 应该返回 400 和验证错误
```

### 单元测试
```bash
cd apps/api
pnpm test -- reports.test.ts
# 所有测试应该通过
```

---

## 参考文档

- [api-design.md](../api-design.md) - API 设计详细文档
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Express Routing](https://expressjs.com/en/guide/routing.html)

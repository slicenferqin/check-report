# Story 3.6: 报告删除功能开发

**Epic:** Epic 3 - 管理后台与报告管理功能

**优先级:** P2

**状态:** TODO

**依赖:** Story 3.3 (报告列表) 完成

---

## 用户故事

作为一名**管理员**,
我想**删除错误上传或过期的报告**,
以便**保持报告列表的准确性**。

---

## Acceptance Criteria

1. ✅ 实现报告删除 API 接口 `DELETE /api/admin/reports/:id`,根据报告 ID 删除报告
2. ✅ 接口必须包含身份认证中间件,验证 JWT Token
3. ✅ 删除操作必须同时删除数据库记录和本地文件系统中的文件
4. ✅ 删除成功时,返回 200 状态码和成功信息 `{ "message": "报告删除成功" }`
5. ✅ 报告 ID 不存在时,返回 404 状态码和错误信息
6. ✅ 文件删除失败时,记录日志但不阻止数据库记录删除 (避免数据不一致)
7. ✅ 在报告列表页的"删除"按钮上实现删除功能
8. ✅ 点击删除按钮时,弹出确认对话框:"确定要删除该报告吗?删除后无法恢复"
9. ✅ 用户确认后,发起删除请求,显示 Loading 状态
10. ✅ 删除成功后,刷新报告列表,移除已删除的报告
11. ✅ 删除失败时,显示错误提示信息
12. ✅ 编写单元测试,覆盖删除成功、报告不存在等场景
13. ✅ 测试删除功能,验证报告在前台查询页无法再被查询到

---

## 技术要点

### 后端删除 API
```typescript
// apps/api/src/routes/admin.ts
import fs from 'fs'
import path from 'path'

router.delete('/admin/reports/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    // 查询报告
    const report = await prisma.report.findUnique({
      where: { id }
    })

    if (!report) {
      return res.status(404).json({ error: '报告不存在' })
    }

    // 删除数据库记录
    await prisma.report.delete({
      where: { id }
    })

    // 删除文件
    try {
      const filePath = path.join(process.cwd(), 'uploads', report.fileUrl)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (fileError) {
      // 文件删除失败只记录日志,不影响数据库删除结果
      console.error('删除文件失败:', fileError)
    }

    res.status(200).json({ message: '报告删除成功' })
  } catch (error) {
    console.error('删除报告失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})
```

### 前端删除功能
```typescript
// apps/web/src/pages/admin/ReportsListPage.tsx
import { Modal } from 'antd'

export const ReportsListPage = () => {
  // ... 其他代码

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除报告 "${record.reportNumber}" 吗?删除后无法恢复`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await api.delete(`/admin/reports/${record.id}`)
          message.success('报告删除成功')
          // 刷新列表
          fetchReports(pagination.current, pagination.pageSize)
        } catch (error) {
          message.error('删除失败,请稍后重试')
        }
      }
    })
  }

  // ... 其他代码
}
```

### 批量删除功能 (可选扩展)
```typescript
// 后端批量删除 API
router.delete('/admin/reports/batch', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body // 数组: [1, 2, 3]

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供要删除的报告ID' })
    }

    // 查询要删除的报告
    const reports = await prisma.report.findMany({
      where: { id: { in: ids } }
    })

    // 删除数据库记录
    await prisma.report.deleteMany({
      where: { id: { in: ids } }
    })

    // 删除文件
    reports.forEach(report => {
      try {
        const filePath = path.join(process.cwd(), 'uploads', report.fileUrl)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (fileError) {
        console.error('删除文件失败:', fileError)
      }
    })

    res.status(200).json({
      message: `成功删除 ${reports.length} 条报告`
    })
  } catch (error) {
    console.error('批量删除失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 前端实现
const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

const rowSelection = {
  selectedRowKeys,
  onChange: (keys: number[]) => setSelectedRowKeys(keys)
}

const handleBatchDelete = () => {
  if (selectedRowKeys.length === 0) {
    message.warning('请先选择要删除的报告')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.length} 条报告吗?删除后无法恢复`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await api.delete('/admin/reports/batch', {
          data: { ids: selectedRowKeys }
        })
        message.success('批量删除成功')
        setSelectedRowKeys([])
        fetchReports()
      } catch (error) {
        message.error('删除失败,请稍后重试')
      }
    }
  })
}
```

---

## 任务拆解

- [ ] 实现 `DELETE /admin/reports/:id` API 接口
  - [ ] 查询报告是否存在
  - [ ] 删除数据库记录
  - [ ] 删除本地文件
  - [ ] 错误处理
- [ ] 更新报告列表页的"删除"按钮功能
- [ ] 实现确认对话框
- [ ] 实现删除成功后列表刷新
- [ ] (可选) 实现批量删除功能
- [ ] 编写单元测试
- [ ] 集成测试

---

## 验收测试

### 单个删除测试
```
1. 登录管理后台
2. 进入报告列表
3. 点击某条报告的"删除"按钮
4. 验证: 弹出确认对话框
5. 验证: 对话框显示报告编号
6. 点击"确定"
7. 验证: 显示"报告删除成功"提示
8. 验证: 列表中该报告已被移除
9. 在公众查询页面查询该报告编号
10. 验证: 显示"未找到该报告"
```

### 取消删除测试
```
1. 点击"删除"按钮
2. 弹出确认对话框
3. 点击"取消"
4. 验证: 对话框关闭
5. 验证: 报告未被删除
```

### 报告不存在测试
```
1. 使用 API 工具直接调用删除接口,使用不存在的ID
curl -X DELETE http://localhost:3000/api/admin/reports/99999 \
  -H "Authorization: Bearer <TOKEN>"
2. 验证: 返回 404 和"报告不存在"错误
```

### 文件删除验证
```
1. 记录要删除报告的文件路径
2. 删除报告
3. 检查本地文件系统
4. 验证: 文件已被删除
```

### 批量删除测试 (如果实现)
```
1. 在报告列表勾选多条报告
2. 点击"批量删除"按钮
3. 弹出确认对话框
4. 验证: 显示选中数量
5. 点击"确定"
6. 验证: 所有选中报告被删除
7. 验证: 列表刷新
```

### 并发删除测试
```
1. 快速连续点击两次"删除"按钮
2. 验证: 第一次删除成功
3. 验证: 第二次删除返回 404 (报告已不存在)
4. 验证: 不会出现崩溃或异常
```

---

## 参考文档

- [api-design.md](../api-design.md) - API 接口文档
- [Ant Design Modal](https://ant.design/components/modal)
- [Node.js File System](https://nodejs.org/api/fs.html)

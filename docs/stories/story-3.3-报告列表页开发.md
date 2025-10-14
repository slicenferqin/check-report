# Story 3.3: 报告列表页开发

**Epic:** Epic 3 - 管理后台与报告管理功能

**优先级:** P1

**状态:** TODO

**依赖:** Story 3.2 完成 (管理后台布局已实现)

---

## 用户故事

作为一名**管理员**,
我想**查看所有已上传的报告列表**,
以便**快速浏览和管理报告**。

---

## Acceptance Criteria

1. ✅ 实现报告列表 API 接口 `GET /api/admin/reports`,返回所有报告的列表 (包含分页参数)
2. ✅ 接口必须包含身份认证中间件,验证 JWT Token
3. ✅ 接口支持分页查询 (如 `?page=1&limit=20`),默认每页 20 条
4. ✅ 返回数据包括报告编号、报告类型、检测日期、设备名称、创建时间
5. ✅ 实现前端报告列表页 (`/admin/reports`),使用表格组件展示报告列表
6. ✅ 表格包含以下列:报告编号、报告类型、检测日期、设备名称、操作
7. ✅ 操作列包含"查看"、"编辑"、"删除"按钮
8. ✅ 点击"查看"按钮,跳转到报告详情页 (前台页面或后台详情页)
9. ✅ 实现分页控件,支持切换页码
10. ✅ 页面加载时显示 Loading 状态,数据加载完成后渲染表格
11. ✅ 列表为空时,显示"暂无报告"提示
12. ✅ 测试列表页在不同数据量下的加载速度和显示效果

---

## 技术要点

### 后端列表 API
```typescript
// apps/api/src/routes/admin.ts
router.get('/admin/reports', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reportNumber: true,
          reportType: true,
          inspectionDate: true,
          equipmentName: true,
          createdAt: true
        }
      }),
      prisma.report.count()
    ])

    res.status(200).json({
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取报告列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})
```

### 前端列表页面
```typescript
// apps/web/src/pages/admin/ReportsListPage.tsx
import { useEffect, useState } from 'react'
import { Table, Button, Space, message } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export const ReportsListPage = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })
  const navigate = useNavigate()

  const fetchReports = async (page = 1, limit = 20) => {
    setLoading(true)
    try {
      const response = await api.get('/admin/reports', {
        params: { page, limit }
      })
      setReports(response.data.data)
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total
      })
    } catch (error) {
      message.error('获取报告列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleTableChange = (newPagination: any) => {
    fetchReports(newPagination.current, newPagination.pageSize)
  }

  const handleView = (record: any) => {
    // 跳转到公众报告详情页
    navigate(`/reports/${record.reportNumber}`)
  }

  const handleEdit = (record: any) => {
    navigate(`/admin/reports/${record.id}/edit`)
  }

  const handleDelete = (record: any) => {
    // 将在 Story 3.6 实现
    message.info('删除功能将在后续实现')
  }

  const columns = [
    {
      title: '报告编号',
      dataIndex: 'reportNumber',
      key: 'reportNumber',
      width: 150
    },
    {
      title: '报告类型',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 150,
      render: (type: string) =>
        type === 'INSPECTION_CERT' ? '检测合格证' : '安装委托检验'
    },
    {
      title: '检测日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h1>报告列表</h1>
      <Table
        columns={columns}
        dataSource={reports}
        loading={loading}
        rowKey="id"
        pagination={pagination}
        onChange={handleTableChange}
        locale={{
          emptyText: '暂无报告'
        }}
      />
    </div>
  )
}
```

---

## 任务拆解

- [ ] 实现 `GET /admin/reports` API 接口
  - [ ] 添加分页参数
  - [ ] 添加排序 (按创建时间降序)
  - [ ] 返回总数用于分页
- [ ] 创建 `src/pages/admin/ReportsListPage.tsx`
- [ ] 实现表格展示
- [ ] 实现分页功能
- [ ] 实现操作按钮
- [ ] 处理 Loading 状态
- [ ] 处理空列表状态
- [ ] 编写单元测试
- [ ] 测试不同数据量下的性能

---

## 验收测试

### 列表展示测试
```
1. 登录管理后台
2. 点击"报告列表"
3. 验证: 显示报告列表表格
4. 验证: 表格显示正确的列
5. 验证: 数据按创建时间降序排列
```

### 分页测试
```
1. 准备 > 20 条测试数据
2. 访问报告列表
3. 验证: 只显示前 20 条
4. 验证: 分页控件显示总数
5. 点击第 2 页
6. 验证: 显示第 21-40 条数据
```

### 操作按钮测试
```
1. 点击"查看"按钮
2. 验证: 跳转到报告详情页
3. 返回列表
4. 点击"编辑"按钮
5. 验证: 跳转到编辑页面 (占位符)
```

### 空列表测试
```
1. 清空数据库中的所有报告
2. 访问报告列表
3. 验证: 显示"暂无报告"提示
4. 验证: 不显示分页控件
```

### 性能测试
```
准备 1000 条测试数据:
- 列表加载时间 < 1 秒
- 分页切换流畅
- 表格渲染正常

准备 10000 条测试数据:
- 列表加载时间 < 2 秒
- 考虑添加虚拟滚动优化
```

---

## 参考文档

- [api-design.md](../api-design.md) - API 接口文档
- [Ant Design Table](https://ant.design/components/table)
- [Prisma Pagination](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

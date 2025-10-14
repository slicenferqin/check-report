# Story 3.5: 报告编辑功能开发

**Epic:** Epic 3 - 管理后台与报告管理功能

**优先级:** P2

**状态:** TODO

**依赖:** Story 3.3 (报告列表) 完成

---

## 用户故事

作为一名**管理员**,
我想**编辑已上传报告的元数据信息**,
以便**纠正错误或更新报告信息**。

---

## Acceptance Criteria

1. ✅ 实现报告编辑 API 接口 `PUT /api/admin/reports/:id`,接收报告 ID 和更新的字段
2. ✅ 接口必须包含身份认证中间件,验证 JWT Token
3. ✅ 接口支持更新以下字段:`report_type`、`inspection_date`、`equipment_name`、`client_company`、`user_company`
4. ✅ 报告编号 (`report_number`) 不允许修改
5. ✅ 文件 URL (`file_url`) 不允许通过此接口修改 (如需更换文件,应删除后重新上传)
6. ✅ 更新成功时,返回 200 状态码和更新后的报告 JSON
7. ✅ 报告 ID 不存在时,返回 404 状态码和错误信息
8. ✅ 实现前端报告编辑页面 (`/admin/reports/:id/edit`),预填充现有报告数据
9. ✅ 编辑页面表单与上传页面类似,但不包含报告编号和文件上传 (显示为只读或不可编辑)
10. ✅ 提交编辑后,显示成功提示并跳转回报告列表页
11. ✅ 编辑失败时,显示错误提示信息
12. ✅ 测试编辑功能,验证数据更新是否正确反映在列表和详情页

---

## 技术要点

### 后端编辑 API
```typescript
// apps/api/src/routes/admin.ts
router.put('/admin/reports/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const {
      reportType,
      inspectionDate,
      equipmentName,
      clientCompany,
      userCompany
    } = req.body

    // 验证报告是否存在
    const existing = await prisma.report.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ error: '报告不存在' })
    }

    // 更新报告
    const updated = await prisma.report.update({
      where: { id },
      data: {
        reportType,
        inspectionDate: new Date(inspectionDate),
        equipmentName,
        clientCompany,
        userCompany
      }
    })

    res.status(200).json(updated)
  } catch (error) {
    console.error('编辑报告失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})
```

### 获取单个报告 API
```typescript
// apps/api/src/routes/admin.ts
router.get('/admin/reports/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const report = await prisma.report.findUnique({
      where: { id }
    })

    if (!report) {
      return res.status(404).json({ error: '报告不存在' })
    }

    res.status(200).json(report)
  } catch (error) {
    console.error('获取报告失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})
```

### 前端编辑页面
```typescript
// apps/web/src/pages/admin/EditReportPage.tsx
import { useEffect, useState } from 'react'
import { Form, Input, Select, DatePicker, Button, Spin, message } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import api from '../../services/api'

export const EditReportPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(`/admin/reports/${id}`)
        const data = response.data
        setReport(data)

        // 预填充表单
        form.setFieldsValue({
          reportType: data.reportType,
          inspectionDate: dayjs(data.inspectionDate),
          equipmentName: data.equipmentName,
          clientCompany: data.clientCompany,
          userCompany: data.userCompany
        })
      } catch (error) {
        message.error('加载报告失败')
        navigate('/admin/reports')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [id, form, navigate])

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      const updateData = {
        reportType: values.reportType,
        inspectionDate: values.inspectionDate.format('YYYY-MM-DD'),
        equipmentName: values.equipmentName,
        clientCompany: values.clientCompany,
        userCompany: values.userCompany
      }

      await api.put(`/admin/reports/${id}`, updateData)

      message.success('报告更新成功')
      navigate('/admin/reports')
    } catch (error) {
      message.error('更新失败,请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Spin size="large" />
  }

  return (
    <div>
      <h1>编辑报告</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Form.Item label="报告编号">
          <Input value={report.reportNumber} disabled />
        </Form.Item>

        <Form.Item
          label="报告类型"
          name="reportType"
          rules={[{ required: true, message: '请选择报告类型' }]}
        >
          <Select>
            <Select.Option value="INSPECTION_CERT">检测合格证</Select.Option>
            <Select.Option value="INSTALLATION_INSPECTION">
              安装委托检验
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="检测日期"
          name="inspectionDate"
          rules={[{ required: true, message: '请选择检测日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="设备名称"
          name="equipmentName"
          rules={[{ required: true, message: '请输入设备名称' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="委托单位"
          name="clientCompany"
          rules={[{ required: true, message: '请输入委托单位' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="使用单位"
          name="userCompany"
          rules={[{ required: true, message: '请输入使用单位' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="报告文件">
          <Input value={report.fileUrl} disabled />
          <p style={{ color: '#999', marginTop: 8 }}>
            注: 如需更换文件,请删除报告后重新上传
          </p>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            保存修改
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => navigate('/admin/reports')}
          >
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
```

---

## 任务拆解

- [ ] 实现 `PUT /admin/reports/:id` API 接口
- [ ] 实现 `GET /admin/reports/:id` API 接口
- [ ] 创建 `src/pages/admin/EditReportPage.tsx`
- [ ] 实现数据加载和表单预填充
- [ ] 实现表单验证
- [ ] 实现保存修改功能
- [ ] 实现取消按钮
- [ ] 更新报告列表页的"编辑"按钮链接
- [ ] 编写单元测试
- [ ] 集成测试

---

## 验收测试

### 成功编辑测试
```
1. 从报告列表点击某条报告的"编辑"按钮
2. 验证: 跳转到编辑页面 /admin/reports/:id/edit
3. 验证: 表单预填充了现有数据
4. 验证: 报告编号和文件URL为只读
5. 修改设备名称
6. 点击"保存修改"
7. 验证: 显示"报告更新成功"提示
8. 验证: 跳转回报告列表
9. 验证: 列表中该报告的设备名称已更新
```

### 报告不存在测试
```
1. 直接访问 /admin/reports/99999/edit (不存在的ID)
2. 验证: 显示"加载报告失败"提示
3. 验证: 自动跳转回报告列表
```

### 取消编辑测试
```
1. 进入编辑页面
2. 修改某些字段
3. 点击"取消"按钮
4. 验证: 跳转回报告列表
5. 验证: 修改未保存
```

### 字段验证测试
```
1. 进入编辑页面
2. 清空设备名称
3. 点击"保存修改"
4. 验证: 显示"请输入设备名称"提示
5. 验证: 表单不提交
```

### 数据一致性测试
```
1. 编辑一个报告
2. 保存修改
3. 在公众查询页面查询该报告
4. 验证: 报告详情页显示更新后的信息
```

---

## 参考文档

- [api-design.md](../api-design.md) - API 接口文档
- [Ant Design Form](https://ant.design/components/form)
- [dayjs Documentation](https://day.js.org)

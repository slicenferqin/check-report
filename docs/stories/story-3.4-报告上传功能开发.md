# Story 3.4: 报告上传功能开发

**Epic:** Epic 3 - 管理后台与报告管理功能

**优先级:** P0

**状态:** TODO

**依赖:** Story 1.4、1.5 (文件上传API和报告创建API) 和 Story 3.2 (管理后台布局) 完成

---

## 用户故事

作为一名**管理员**,
我想**上传新的报告扫描件并填写报告信息**,
以便**让客户能够查询到这份报告**。

---

## Acceptance Criteria

1. ✅ 实现报告上传页面 (`/admin/upload`),包含表单和文件上传组件
2. ✅ 表单字段包括:
   - 报告编号 (必填,文本输入)
   - 报告类型 (必填,下拉选择:检测合格证、安装委托检验)
   - 检测日期 (必填,日期选择器)
   - 设备名称 (必填,文本输入)
   - 委托单位 (必填,文本输入)
   - 使用单位 (必填,文本输入)
   - 报告文件 (必填,文件上传,支持 PDF、JPG、PNG,最大 10MB)
3. ✅ 文件上传组件支持拖拽上传和点击选择文件
4. ✅ 文件选择后,显示文件名和文件大小,允许用户重新选择
5. ✅ 提交表单时,先调用文件上传接口 `POST /api/admin/upload` 获取文件 URL
6. ✅ 文件上传成功后,再调用报告创建接口 `POST /api/admin/reports` 提交完整数据
7. ✅ 上传过程中,显示上传进度 (如进度条) 和"上传中"状态
8. ✅ 上传成功后,显示成功提示并清空表单,允许继续上传
9. ✅ 上传失败时,显示具体的错误信息 (如"文件类型不支持"、"报告编号已存在")
10. ✅ 实现表单验证,必填字段不能为空,文件必须选择
11. ✅ 测试上传不同类型和大小的文件,验证上传功能的稳定性
12. ✅ 测试报告编号重复的情况,确保错误提示清晰

---

## 技术要点

### 前端上传页面
```typescript
// apps/web/src/pages/admin/UploadPage.tsx
import { useState } from 'react'
import { Form, Input, Select, DatePicker, Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import api from '../../services/api'
import dayjs from 'dayjs'

export const UploadPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('请选择文件')
      return
    }

    setLoading(true)
    try {
      // 1. 先上传文件
      const formData = new FormData()
      formData.append('file', fileList[0].originFileObj!)

      const uploadResponse = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { fileUrl, fileType } = uploadResponse.data

      // 2. 创建报告记录
      const reportData = {
        reportNumber: values.reportNumber,
        reportType: values.reportType,
        inspectionDate: values.inspectionDate.format('YYYY-MM-DD'),
        equipmentName: values.equipmentName,
        clientCompany: values.clientCompany,
        userCompany: values.userCompany,
        fileUrl,
        fileType
      }

      await api.post('/admin/reports', reportData)

      message.success('报告上传成功')
      form.resetFields()
      setFileList([])
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error('报告编号已存在')
      } else if (error.response?.status === 400) {
        message.error(error.response.data.error || '上传失败')
      } else {
        message.error('上传失败,请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isPDF = file.type === 'application/pdf'
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isValidType = isPDF || isJPG || isPNG

      if (!isValidType) {
        message.error('只支持 PDF、JPG、PNG 格式')
        return Upload.LIST_IGNORE
      }

      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB')
        return Upload.LIST_IGNORE
      }

      setFileList([file as any])
      return false // 阻止自动上传
    },
    fileList,
    onRemove: () => {
      setFileList([])
    },
    maxCount: 1
  }

  return (
    <div>
      <h1>上传报告</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          label="报告编号"
          name="reportNumber"
          rules={[{ required: true, message: '请输入报告编号' }]}
        >
          <Input placeholder="如: ZJW20230145" />
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
          <Input placeholder="如: 挖掘机 XE60DA" />
        </Form.Item>

        <Form.Item
          label="委托单位"
          name="clientCompany"
          rules={[{ required: true, message: '请输入委托单位' }]}
        >
          <Input placeholder="委托单位名称" />
        </Form.Item>

        <Form.Item
          label="使用单位"
          name="userCompany"
          rules={[{ required: true, message: '请输入使用单位' }]}
        >
          <Input placeholder="使用单位名称" />
        </Form.Item>

        <Form.Item label="报告文件" required>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持 PDF、JPG、PNG 格式,文件大小不超过 10MB
            </p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            提交上传
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
```

---

## 任务拆解

- [ ] 创建 `src/pages/admin/UploadPage.tsx`
- [ ] 实现表单布局和字段
- [ ] 实现文件上传组件
- [ ] 实现文件类型和大小验证
- [ ] 实现两步上传流程
  - [ ] 先上传文件获取 URL
  - [ ] 再创建报告记录
- [ ] 实现表单验证
- [ ] 实现成功/失败提示
- [ ] 实现表单重置
- [ ] 编写单元测试
- [ ] 集成测试

---

## 验收测试

### 成功上传测试
```
1. 登录管理后台
2. 点击"上传报告"
3. 填写所有必填字段
4. 上传一个 PDF 文件 (< 10MB)
5. 点击"提交上传"
6. 验证: 显示"上传中"状态
7. 验证: 显示"报告上传成功"提示
8. 验证: 表单清空
9. 在报告列表中验证新报告存在
```

### 文件类型验证
```
1. 尝试上传 TXT 文件
2. 验证: 显示"只支持 PDF、JPG、PNG 格式"
3. 验证: 文件列表为空
```

### 文件大小验证
```
1. 创建一个 > 10MB 的 PDF 文件
2. 尝试上传
3. 验证: 显示"文件大小不能超过 10MB"
4. 验证: 文件列表为空
```

### 报告编号重复
```
1. 填写已存在的报告编号
2. 上传文件并提交
3. 验证: 显示"报告编号已存在"
4. 验证: 表单不清空,用户可修改编号重新提交
```

### 必填字段验证
```
1. 不填写报告编号
2. 点击提交
3. 验证: 显示"请输入报告编号"提示
4. 验证: 表单不提交
```

### 文件预览
```
1. 选择文件后
2. 验证: 显示文件名
3. 验证: 显示文件大小
4. 点击删除图标
5. 验证: 文件被移除
6. 可重新选择文件
```

---

## 参考文档

- [api-design.md](../api-design.md) - API 接口文档
- [Ant Design Upload](https://ant.design/components/upload)
- [Ant Design Form](https://ant.design/components/form)

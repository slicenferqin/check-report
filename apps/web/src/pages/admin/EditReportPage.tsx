import { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, Upload, Button, App, Card, Space, Spin } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadFile, RcFile } from 'antd/es/upload/interface'
import { adminApi } from '../../services/api'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

const { Dragger } = Upload

export const EditReportPage = () => {
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [originalFileUrl, setOriginalFileUrl] = useState('')
  const navigate = useNavigate()
  const { message } = App.useApp()

  // 加载报告数据
  useEffect(() => {
    const loadReport = async () => {
      if (!id) return

      try {
        const report = await adminApi.getReport(parseInt(id))

        // 设置表单数据
        form.setFieldsValue({
          reportNumber: report.reportNumber,
          reportType: report.reportType,
          inspectionDate: dayjs(report.inspectionDate),
          equipmentName: report.equipmentName,
          clientCompany: report.clientCompany,
          userCompany: report.userCompany
        })

        // 保存原始文件URL
        setOriginalFileUrl(report.fileUrl)

        // 设置文件列表（显示现有文件）
        setFileList([{
          uid: '-1',
          name: `${report.reportNumber}.${report.fileType}`,
          status: 'done',
          url: report.fileUrl
        }])
      } catch (error) {
        message.error('加载报告失败')
        navigate('/admin/reports')
      } finally {
        setPageLoading(false)
      }
    }

    loadReport()
  }, [id, form, message, navigate])

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      let fileUrl = originalFileUrl
      let fileType = originalFileUrl.split('.').pop() || ''

      // 如果用户上传了新文件，先上传文件
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj!
        const uploadResult = await adminApi.uploadFile(file)
        fileUrl = uploadResult.fileUrl
        fileType = uploadResult.fileType
      }

      // 更新报告记录
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

      await adminApi.updateReport(parseInt(id!), reportData)

      message.success('报告更新成功')

      // 跳转到报告列表
      setTimeout(() => {
        navigate('/admin/reports')
      }, 1500)
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error('报告编号已存在')
      } else if (error.response?.status === 400) {
        message.error(error.response.data.error || '更新失败')
      } else {
        message.error('更新失败,请稍后重试')
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

      // 创建符合 UploadFile 结构的对象
      setFileList([{
        uid: '-1',
        name: file.name,
        status: 'done',
        originFileObj: file as RcFile
      }])
      return false // 阻止自动上传
    },
    fileList,
    onRemove: () => {
      // 如果删除了文件，保留原始文件信息
      setFileList([{
        uid: '-1',
        name: originalFileUrl.split('/').pop() || '',
        status: 'done',
        url: originalFileUrl
      }])
    },
    maxCount: 1
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">编辑报告</h1>
        <Button onClick={() => navigate('/admin/reports')}>
          返回列表
        </Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 800 }}
        >
          <Form.Item
            label="报告编号"
            name="reportNumber"
            rules={[{ required: true, message: '请输入报告编号' }]}
            extra="例如: ZJW20230145"
          >
            <Input placeholder="请输入报告编号" />
          </Form.Item>

          <Form.Item
            label="报告类型"
            name="reportType"
            rules={[{ required: true, message: '请选择报告类型' }]}
          >
            <Select placeholder="请选择报告类型">
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
            <DatePicker style={{ width: '100%' }} placeholder="选择检测日期" />
          </Form.Item>

          <Form.Item
            label="设备名称"
            name="equipmentName"
            rules={[{ required: true, message: '请输入设备名称' }]}
            extra="例如: 挖掘机 XE60DA"
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>

          <Form.Item
            label="委托单位"
            name="clientCompany"
            rules={[{ required: true, message: '请输入委托单位' }]}
          >
            <Input placeholder="请输入委托单位名称" />
          </Form.Item>

          <Form.Item
            label="使用单位"
            name="userCompany"
            rules={[{ required: true, message: '请输入使用单位' }]}
          >
            <Input placeholder="请输入使用单位名称" />
          </Form.Item>

          <Form.Item
            label="报告文件"
            extra="支持 PDF、JPG、PNG 格式,文件大小不超过 10MB。如不更换文件，保留现有文件即可。"
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                点击或拖拽文件到此区域上传新文件
              </p>
              <p className="ant-upload-hint">
                支持 PDF、JPG、PNG 格式,单个文件不超过 10MB
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                保存更新
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/admin/reports')}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

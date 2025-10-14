import { useState } from 'react'
import { Form, Input, Select, DatePicker, Upload, Button, message, Card, Space } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadFile, RcFile } from 'antd/es/upload/interface'
import { adminApi } from '../../services/api'
import { useNavigate } from 'react-router-dom'

const { Dragger } = Upload

export const UploadPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const navigate = useNavigate()

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('请选择文件')
      return
    }

    setLoading(true)
    try {
      // 1. 先上传文件
      const file = fileList[0].originFileObj!
      const uploadResult = await adminApi.uploadFile(file)

      // 2. 创建报告记录
      const reportData = {
        reportNumber: values.reportNumber,
        reportType: values.reportType,
        inspectionDate: values.inspectionDate.format('YYYY-MM-DD'),
        equipmentName: values.equipmentName,
        clientCompany: values.clientCompany,
        userCompany: values.userCompany,
        fileUrl: uploadResult.fileUrl,
        fileType: uploadResult.fileType
      }

      await adminApi.createReport(reportData)

      message.success('报告上传成功')
      form.resetFields()
      setFileList([])

      // 跳转到报告列表
      setTimeout(() => {
        navigate('/admin/reports')
      }, 1500)
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
      setFileList([])
    },
    maxCount: 1
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">上传报告</h1>
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
            required
            extra="支持 PDF、JPG、PNG 格式,文件大小不超过 10MB"
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                点击或拖拽文件到此区域上传
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
                提交上传
              </Button>
              <Button
                size="large"
                onClick={() => {
                  form.resetFields()
                  setFileList([])
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Spin, App } from 'antd'
import { DownloadOutlined, HomeOutlined } from '@ant-design/icons'
import { reportApi } from '../services/api'
import { InlineFilePreview } from '../components/InlineFilePreview'

export const ReportDetailPage = () => {
  const { reportNumber } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { message } = App.useApp()

  useEffect(() => {
    const loadReport = async () => {
      if (!reportNumber) return

      try {
        const data = await reportApi.queryReport(reportNumber)
        setReport(data)
      } catch (error) {
        message.error('加载报告失败')
        setTimeout(() => navigate('/'), 2000)
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [reportNumber, navigate])

  const handleDownload = async () => {
    if (!report) return

    try {
      // 使用相对路径，避免跨域问题
      // 如果前后端部署在同一域名下，直接使用相对路径
      const fileUrl = `/uploads/${report.fileUrl}`

      // 先检查文件是否存在
      const response = await fetch(fileUrl, { method: 'HEAD' })
      if (!response.ok) {
        message.error('报告文件不存在或已被删除,请联系管理员')
        return
      }

      const fileName = `${report.reportNumber}.${report.fileType.toLowerCase()}`
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      message.success('开始下载报告文件')
    } catch (error) {
      console.error('下载报告失败:', error)
      message.error('下载失败,请稍后重试')
    }
  }

  const getReportTypeText = (type: string) => {
    return type === 'INSPECTION_CERT' ? '检测合格证' : '安装委托检验'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">报告不存在</p>
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 报告信息卡片 */}
        <Card
          title={
            <div className="text-2xl font-bold">
              报告详情 - {report.reportNumber}
            </div>
          }
          className="mb-6"
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
            <Descriptions.Item label="报告编号">{report.reportNumber}</Descriptions.Item>
            <Descriptions.Item label="报告类型">
              {getReportTypeText(report.reportType)}
            </Descriptions.Item>
            <Descriptions.Item label="检测日期">
              {new Date(report.inspectionDate).toLocaleDateString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="设备名称">{report.equipmentName}</Descriptions.Item>
            <Descriptions.Item label="委托单位">{report.clientCompany}</Descriptions.Item>
            <Descriptions.Item label="使用单位">{report.userCompany}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 文件预览区域 */}
        <div className="mb-6">
          <InlineFilePreview
            fileUrl={`/uploads/${report.fileUrl}`}
            fileType={report.fileType}
            fileName={`${report.reportNumber}.${report.fileType.toLowerCase()}`}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center pb-8">
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            下载报告
          </Button>
          <Button
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
        </div>
      </div>
    </div>
  )
}

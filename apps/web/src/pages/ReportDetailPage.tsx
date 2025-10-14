import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Spin, message } from 'antd'
import { DownloadOutlined, HomeOutlined } from '@ant-design/icons'
import { reportApi } from '../services/api'

export const ReportDetailPage = () => {
  const { reportNumber } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const handleDownload = () => {
    if (!report) return
    const API_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001'
    const fileUrl = `${API_URL}/uploads/${report.fileUrl}`
    const fileName = `${report.reportNumber}.${report.fileType.toLowerCase()}`

    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          title={
            <div className="text-2xl font-bold">
              报告详情 - {report.reportNumber}
            </div>
          }
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

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">报告文件预览</h3>
            {report.fileType === 'PDF' ? (
              <div className="bg-white p-4 rounded text-center">
                <p className="text-gray-600 mb-4">
                  PDF 文件预览功能开发中...
                </p>
                <p className="text-sm text-gray-500">
                  文件路径: {report.fileUrl}
                </p>
              </div>
            ) : (
              <div className="bg-white p-4 rounded">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001'}/uploads/${report.fileUrl}`}
                  alt="报告扫描件"
                  className="max-w-full h-auto mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png'
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4 justify-center">
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
        </Card>
      </div>
    </div>
  )
}

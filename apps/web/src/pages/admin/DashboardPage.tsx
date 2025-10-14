import { useEffect, useState } from 'react'
import { Card, Statistic, Row, Col, Spin } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import { adminApi } from '../../services/api'

export const DashboardPage = () => {
  const [stats, setStats] = useState({ totalReports: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats()
        setStats(data)
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">系统概览</h1>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="已上传报告总数"
              value={stats.totalReports}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-8">
        <Card title="快速开始">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                📝 上传新报告
              </h3>
              <p className="text-blue-700">
                点击左侧菜单中的"上传报告"开始上传新的检测报告
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                📊 查看报告列表
              </h3>
              <p className="text-green-700">
                点击左侧菜单中的"报告列表"查看和管理所有已上传的报告
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

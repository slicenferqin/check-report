import { useEffect, useState } from 'react'
import { Table, Button, Space, message, Modal, Tag } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../services/api'

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
      const response = await adminApi.getReports(page, limit)
      setReports(response.data)
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total
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
    navigate(`/reports/${record.reportNumber}`)
  }

  const handleEdit = (_record: any) => {
    message.info('编辑功能开发中...')
    // navigate(`/admin/reports/${_record.id}/edit`)
  }

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除报告 "${record.reportNumber}" 吗?删除后无法恢复`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await adminApi.deleteReport(record.id)
          message.success('报告删除成功')
          fetchReports(pagination.current, pagination.pageSize)
        } catch (error) {
          message.error('删除失败,请稍后重试')
        }
      }
    })
  }

  const getReportTypeTag = (type: string) => {
    if (type === 'INSPECTION_CERT') {
      return <Tag color="blue">检测合格证</Tag>
    }
    return <Tag color="green">安装委托检验</Tag>
  }

  const columns = [
    {
      title: '报告编号',
      dataIndex: 'reportNumber',
      key: 'reportNumber',
      width: 150,
      fixed: 'left' as const
    },
    {
      title: '报告类型',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 150,
      render: (type: string) => getReportTypeTag(type)
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
      key: 'equipmentName',
      width: 200
    },
    {
      title: '委托单位',
      dataIndex: 'clientCompany',
      key: 'clientCompany',
      width: 200
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
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">报告列表</h1>
        <Button type="primary" onClick={() => navigate('/admin/upload')}>
          上传新报告
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={reports}
        loading={loading}
        rowKey="id"
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: '暂无报告'
        }}
      />
    </div>
  )
}

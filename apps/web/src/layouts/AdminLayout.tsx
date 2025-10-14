import { Layout, Menu } from 'antd'
import { FileTextOutlined, UploadOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const { Sider, Header, Content } = Layout

export const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const username = localStorage.getItem('username') || '管理员'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/admin/login')
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '首页'
    },
    {
      key: '/admin/reports',
      icon: <FileTextOutlined />,
      label: '报告列表'
    },
    {
      key: '/admin/upload',
      icon: <UploadOutlined />,
      label: '上传报告'
    }
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220}>
        <div className="h-16 flex items-center justify-center text-white text-lg font-bold border-b border-gray-700">
          管理后台
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <LogoutOutlined />
            退出登录
          </button>
        </div>
      </Sider>
      <Layout>
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-700">
            欢迎, {username}
          </div>
        </Header>
        <Content className="m-6">
          <div className="bg-white p-6 rounded-lg shadow-sm min-h-full">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

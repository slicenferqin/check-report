# Story 3.2: 管理后台首页与导航

**Epic:** Epic 3 - 管理后台与报告管理功能

**优先级:** P1

**状态:** TODO

**依赖:** Story 3.1 完成 (登录功能已实现)

---

## 用户故事

作为一名**登录成功的管理员**,
我想**看到管理后台的首页和导航菜单**,
以便**快速访问不同的管理功能**。

---

## Acceptance Criteria

1. ✅ 实现管理后台布局 (Layout),包含侧边栏导航和主内容区域
2. ✅ 侧边栏包含以下菜单项:
   - 报告列表
   - 上传报告
   - 退出登录
3. ✅ 点击菜单项时,切换到对应的页面或组件
4. ✅ 实现退出登录功能,点击后清除 Token 并跳转到登录页
5. ✅ 管理后台首页显示简单的欢迎信息和统计数据 (如已上传报告总数)
6. ✅ 统计数据通过 API 接口 `GET /api/admin/stats` 获取 (返回报告总数)
7. ✅ 未登录用户访问管理后台时,自动跳转到登录页
8. ✅ 页面采用响应式设计,支持平板和桌面端访问
9. ✅ 测试导航切换的流畅性和页面加载速度

---

## 技术要点

### 后端统计 API
```typescript
// apps/api/src/routes/admin.ts
router.get('/admin/stats', authMiddleware, async (req, res) => {
  try {
    const totalReports = await prisma.report.count()

    res.status(200).json({
      totalReports
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})
```

### 前端布局组件
```typescript
// apps/web/src/layouts/AdminLayout.tsx
import { Layout, Menu } from 'antd'
import { FileTextOutlined, UploadOutlined, LogoutOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const { Sider, Header, Content } = Layout

export const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/admin/login')
  }

  const menuItems = [
    {
      key: '/admin/reports',
      icon: <FileTextOutlined />,
      label: '报告列表'
    },
    {
      key: '/admin/upload',
      icon: <UploadOutlined />,
      label: '上传报告'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key !== 'logout') {
      navigate(key)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark">
        <div className="logo">管理后台</div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <span>欢迎, {localStorage.getItem('username')}</span>
        </Header>
        <Content style={{ margin: '24px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
```

### 管理后台首页
```typescript
// apps/web/src/pages/admin/DashboardPage.tsx
import { useEffect, useState } from 'react'
import { Card, Statistic, Row, Col } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import api from '../../services/api'

export const DashboardPage = () => {
  const [stats, setStats] = useState({ totalReports: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats')
        setStats(response.data)
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1>管理后台首页</h1>
      <p>欢迎使用报告管理系统</p>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="已上传报告总数"
              value={stats.totalReports}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
```

### 路由守卫
```typescript
// apps/web/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公众页面 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/reports/:reportNumber" element={<ReportDetailPage />} />

        {/* 管理后台 */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="reports" element={<ReportsListPage />} />
          <Route path="upload" element={<UploadPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

---

## 任务拆解

- [ ] 实现 `GET /api/admin/stats` 统计 API
- [ ] 创建 `src/layouts/AdminLayout.tsx` 布局组件
- [ ] 创建 `src/pages/admin/DashboardPage.tsx` 首页
- [ ] 创建 `src/components/ProtectedRoute.tsx` 路由守卫
- [ ] 配置管理后台路由
- [ ] 实现退出登录功能
- [ ] 实现菜单导航
- [ ] 响应式样式调整
- [ ] 测试路由守卫
- [ ] 测试导航切换

---

## 验收测试

### 路由守卫测试
```
1. 清除 localStorage 中的 token
2. 直接访问 http://localhost:5173/admin
3. 验证: 自动跳转到 /admin/login
```

### 登录后访问
```
1. 登录成功
2. 验证: 自动跳转到 /admin (首页)
3. 验证: 显示欢迎信息和用户名
4. 验证: 显示报告总数统计
```

### 导航测试
```
1. 点击"报告列表"
2. 验证: 跳转到 /admin/reports
3. 验证: 菜单高亮显示当前页
4. 点击"上传报告"
5. 验证: 跳转到 /admin/upload
```

### 退出登录测试
```
1. 点击"退出登录"
2. 验证: localStorage 中的 token 被清除
3. 验证: 跳转到 /admin/login
4. 尝试直接访问 /admin
5. 验证: 再次跳转到 /admin/login
```

### 响应式测试
```
桌面端 (1920x1080):
- 侧边栏固定宽度 200px
- 主内容区域占据剩余空间

平板端 (768x1024):
- 侧边栏可折叠
- 菜单图标显示
```

---

## 参考文档

- [ui-ux-design.md](../ui-ux-design.md) - UI 设计文档
- [Ant Design Layout](https://ant.design/components/layout)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/overview#authentication)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { HomePage } from './pages/HomePage'
import { ReportDetailPage } from './pages/ReportDetailPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { ReportsListPage } from './pages/admin/ReportsListPage'
import { UploadPage } from './pages/admin/UploadPage'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
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

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App

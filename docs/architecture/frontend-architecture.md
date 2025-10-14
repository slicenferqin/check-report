# Frontend Architecture

## Component Architecture

### Component Organization

```
apps/web/src/
├── components/              # 可复用组件
│   ├── common/              # 通用组件
│   │   ├── Header.tsx       # 页头
│   │   ├── Footer.tsx       # 页脚
│   │   ├── Loading.tsx      # 加载动画
│   │   └── ErrorMessage.tsx # 错误提示
│   ├── public/              # 公众页面组件
│   │   ├── CompanyIntro.tsx # 公司简介
│   │   ├── SearchBox.tsx    # 查询输入框
│   │   └── ReportDetail.tsx # 报告详情展示
│   └── admin/               # 管理后台组件
│       ├── LoginForm.tsx    # 登录表单
│       ├── ReportTable.tsx  # 报告列表表格
│       ├── ReportForm.tsx   # 报告上传/编辑表单
│       └── ProtectedRoute.tsx # 路由守卫
├── pages/                   # 页面组件
│   ├── HomePage.tsx         # 首页
│   ├── ReportDetailPage.tsx # 报告详情页
│   ├── admin/
│   │   ├── LoginPage.tsx    # 登录页
│   │   ├── DashboardPage.tsx # 后台首页
│   │   ├── ReportListPage.tsx # 报告列表页
│   │   ├── UploadPage.tsx   # 上传页
│   │   └── EditPage.tsx     # 编辑页
├── services/                # API 调用服务
│   ├── api.ts               # Axios 配置
│   ├── reportService.ts     # 报告相关 API
│   └── adminService.ts      # 管理员相关 API
├── hooks/                   # 自定义 Hooks
│   ├── useAuth.ts           # 认证状态 Hook
│   └── useReport.ts         # 报告查询 Hook
├── contexts/                # Context API
│   └── AuthContext.tsx      # 认证上下文
├── types/                   # 类型定义（从 shared 包导入）
├── utils/                   # 工具函数
│   ├── format.ts            # 日期格式化等
│   └── constants.ts         # 常量定义
├── styles/                  # 全局样式
│   └── globals.css          # Tailwind 基础样式
├── App.tsx                  # 应用根组件
└── main.tsx                 # 入口文件
```

### Component Template

```typescript
// apps/web/src/components/public/SearchBox.tsx
import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface SearchBoxProps {
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ className }) => {
  const [reportNumber, setReportNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!reportNumber.trim()) {
      message.warning('请输入报告编号');
      return;
    }

    setLoading(true);
    try {
      // 直接导航到报告详情页，由详情页负责查询
      navigate(`/reports/${reportNumber.trim()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        size="large"
        placeholder="请输入报告编号"
        value={reportNumber}
        onChange={(e) => setReportNumber(e.target.value)}
        onKeyPress={handleKeyPress}
        prefix={<SearchOutlined />}
        className="flex-1"
      />
      <Button
        type="primary"
        size="large"
        icon={<SearchOutlined />}
        loading={loading}
        onClick={handleSearch}
      >
        查询
      </Button>
    </div>
  );
};
```

---

## State Management Architecture

### State Structure

```typescript
// apps/web/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminPayload } from '@checkReport/shared';
import { adminService } from '../services/adminService';

interface AuthState {
  isAuthenticated: boolean;
  user: AdminPayload | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 初始化时从 localStorage 恢复认证状态
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await adminService.login({ username, password });
    const { token: newToken, username: userName } = response;

    // 解析 JWT 获取用户信息（简化版，生产环境应使用 jwt-decode）
    const payload = JSON.parse(atob(newToken.split('.')[1])) as AdminPayload;

    setToken(newToken);
    setUser(payload);
    setIsAuthenticated(true);

    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(payload));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### State Management Patterns
- **Authentication State:** 使用 Context API + localStorage 持久化
- **Form State:** 使用 Ant Design Form 内置状态管理
- **API Loading State:** 使用组件本地 useState
- **Server State Caching:** MVP 阶段不使用（未来可引入 React Query）

---

## Routing Architecture

### Route Organization

```typescript
// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ReportDetailPage from './pages/ReportDetailPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ReportListPage from './pages/admin/ReportListPage';
import UploadPage from './pages/admin/UploadPage';
import EditPage from './pages/admin/EditPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 公众路由 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/reports/:reportNumber" element={<ReportDetailPage />} />

          {/* 管理员登录 */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* 受保护的管理员路由 */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="reports" element={<ReportListPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="reports/:id/edit" element={<EditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### Protected Route Pattern

```typescript
// apps/web/src/components/admin/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spin } from 'antd';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // 模拟 Token 验证（生产环境应验证 Token 有效性）
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};
```

---

## Frontend Services Layer

### API Client Setup

```typescript
// apps/web/src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { message } from 'antd';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 创建 Axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/admin/login';
          break;
        case 404:
          // 404 由具体页面处理
          break;
        case 409:
          message.error((data as any)?.error || '操作冲突');
          break;
        case 500:
          message.error('服务器错误，请稍后重试');
          break;
        default:
          message.error((data as any)?.error || '请求失败');
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### Service Example

```typescript
// apps/web/src/services/reportService.ts
import apiClient from './api';
import { Report, CreateReportDto, UpdateReportDto, ReportListQuery } from '@checkReport/shared';

export const reportService = {
  // 公开查询接口
  async getByReportNumber(reportNumber: string): Promise<Report> {
    const { data } = await apiClient.get<Report>(`/reports/${reportNumber}`);
    return data;
  },

  // 管理员接口
  async getList(query: ReportListQuery = {}): Promise<{ data: Report[]; total: number; page: number; limit: number }> {
    const { data } = await apiClient.get('/admin/reports', { params: query });
    return data;
  },

  async create(dto: CreateReportDto): Promise<Report> {
    const { data } = await apiClient.post<Report>('/admin/reports', dto);
    return data;
  },

  async update(id: number, dto: UpdateReportDto): Promise<Report> {
    const { data } = await apiClient.put<Report>(`/admin/reports/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/admin/reports/${id}`);
  },

  async uploadFile(file: File): Promise<{ fileUrl: string; fileType: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
```

---

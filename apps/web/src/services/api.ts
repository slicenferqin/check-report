import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器 - 自动添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理 401 错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// API 接口定义
export const reportApi = {
  // 查询报告
  queryReport: async (reportNumber: string) => {
    const response = await api.get(`/reports/${reportNumber}`)
    return response.data
  }
}

export const authApi = {
  // 管理员登录
  login: async (username: string, password: string) => {
    const response = await api.post('/admin/login', { username, password })
    return response.data
  }
}

export const adminApi = {
  // 获取统计数据
  getStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  // 获取报告列表
  getReports: async (page = 1, limit = 20) => {
    const response = await api.get('/admin/reports', {
      params: { page, limit }
    })
    return response.data
  },

  // 上传文件
  uploadFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 创建报告
  createReport: async (data: any) => {
    const response = await api.post('/admin/reports', data)
    return response.data
  },

  // 更新报告
  updateReport: async (id: number, data: any) => {
    const response = await api.put(`/admin/reports/${id}`, data)
    return response.data
  },

  // 删除报告
  deleteReport: async (id: number) => {
    const response = await api.delete(`/admin/reports/${id}`)
    return response.data
  },

  // 获取单个报告
  getReport: async (id: number) => {
    const response = await api.get(`/admin/reports/${id}`)
    return response.data
  }
}

export default api

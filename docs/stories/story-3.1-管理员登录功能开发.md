# Story 3.1: 管理员登录功能开发

**Epic:** Epic 3 - 管理后台与报告管理功能

**优先级:** P0

**状态:** TODO

**依赖:** Story 1.2 完成 (数据库已有 admins 表)

---

## 用户故事

作为一名**公司内部管理员**,
我想**通过用户名和密码登录管理后台**,
以便**安全地访问报告管理功能**。

---

## Acceptance Criteria

1. ✅ 实现管理员登录 API 接口 `POST /api/admin/login`,接收用户名和密码
2. ✅ 验证用户名和密码,密码使用 bcrypt 进行哈希比对
3. ✅ 登录成功时,生成 JWT Token 并返回 200 状态码和 Token `{ "token": "...", "username": "..." }`
4. ✅ 登录失败时 (用户名不存在或密码错误),返回 401 状态码和错误信息 `{ "error": "用户名或密码错误" }`
5. ✅ 实现前端登录页面 (`/admin/login`),包含用户名、密码输入框和登录按钮
6. ✅ 前端提交登录请求后,显示 Loading 状态
7. ✅ 登录成功后,将 Token 存储到 localStorage,并跳转到管理后台首页
8. ✅ 登录失败时,在登录页显示错误提示信息
9. ✅ 实现身份认证中间件 (用于后续后台 API 接口),验证请求中的 JWT Token
10. ✅ Token 无效或过期时,返回 401 状态码,前端自动跳转到登录页
11. ✅ 编写单元测试,覆盖登录成功、密码错误、用户名不存在等场景
12. ✅ 测试登录功能的前后端集成,确保 Token 能够正确生成和验证

---

## 技术要点

### 后端登录 API
```typescript
// apps/api/src/routes/auth.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // 输入验证
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    // 查询管理员
    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 生成 JWT Token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(200).json({
      token,
      username: admin.username
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
```

### 认证中间件
```typescript
// apps/api/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权,请先登录' })
    }

    const token = authHeader.substring(7) // 移除 "Bearer "
    const decoded = jwt.verify(token, JWT_SECRET)

    // 将解码后的用户信息附加到请求对象
    ;(req as any).user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token 已过期,请重新登录' })
    }
    return res.status(401).json({ error: 'Token 无效' })
  }
}
```

### 前端登录页面
```typescript
// apps/web/src/pages/LoginPage.tsx
import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

export const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const { token, username } = await authApi.login(values.username, values.password)

      // 保存 Token 到 localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)

      message.success('登录成功')
      navigate('/admin')
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('用户名或密码错误')
      } else {
        message.error('登录失败,请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Card title="管理员登录" style={{ width: 400 }}>
        <Form onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
```

### Axios 拦截器配置
```typescript
// apps/web/src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
})

// 请求拦截器 - 自动添加 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理 401 错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/admin/login', { username, password })
    return response.data
  }
}

export default api
```

---

## 任务拆解

- [ ] 安装后端依赖 (`bcrypt`, `jsonwebtoken`)
- [ ] 创建 `src/routes/auth.ts` 登录路由
- [ ] 实现登录 API 接口
- [ ] 创建 `src/middleware/auth.ts` 认证中间件
- [ ] 配置环境变量 `JWT_SECRET`
- [ ] 创建前端登录页面 `src/pages/LoginPage.tsx`
- [ ] 配置 Axios 拦截器
- [ ] 实现路由守卫 (Protected Route)
- [ ] 编写后端单元测试
- [ ] 编写前端单元测试
- [ ] 集成测试

---

## 验收测试

### 后端API测试

**成功登录:**
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
# 应该返回 200 和 Token
```

**密码错误:**
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}'
# 应该返回 401 和错误信息
```

### 前端测试

**成功登录:**
```
1. 访问 http://localhost:5173/admin/login
2. 输入用户名: admin
3. 输入密码: Admin@123
4. 点击登录
5. 验证: 显示成功提示
6. 验证: 跳转到 /admin
7. 验证: localStorage 中有 token
```

**登录失败:**
```
1. 输入错误的用户名或密码
2. 点击登录
3. 验证: 显示错误提示
4. 验证: 不跳转页面
```

### 认证中间件测试
```bash
# 使用有效 Token 访问受保护的 API
curl http://localhost:3000/api/admin/reports \
  -H "Authorization: Bearer <VALID_TOKEN>"
# 应该返回 200

# 不带 Token 访问
curl http://localhost:3000/api/admin/reports
# 应该返回 401

# 使用无效 Token
curl http://localhost:3000/api/admin/reports \
  -H "Authorization: Bearer invalid-token"
# 应该返回 401
```

---

## 参考文档

- [api-design.md](../api-design.md) - API 接口文档
- [JWT.io](https://jwt.io) - JWT 文档
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

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

      localStorage.setItem('token', token)
      localStorage.setItem('username', username)

      message.success('登录成功')
      navigate('/admin')
    } catch (error: any) {
      console.error('登录错误:', error)
      if (error.response?.status === 401) {
        message.error('用户名或密码错误')
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        message.error('无法连接到服务器，请检查后端服务是否运行')
      } else {
        message.error(error.response?.data?.error || '登录失败,请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            管理后台登录
          </h1>
          <p className="text-gray-600">
            检测报告管理系统
          </p>
        </div>

        <Card className="shadow-xl">
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-12"
              >
                登录
              </Button>
            </Form.Item>

            <div className="text-center">
              <a href="/" className="text-blue-600 hover:text-blue-700">
                返回首页
              </a>
            </div>
          </Form>
        </Card>

        <div className="text-center mt-4 text-sm text-gray-500">
          <p>默认账号: admin / Admin@123</p>
        </div>
      </div>
    </div>
  )
}

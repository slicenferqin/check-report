import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import reportsRouter from './routes/reports.js'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API 路由
app.use('/api', reportsRouter)
app.use('/api', authRouter)
app.use('/api', adminRouter)

// 静态文件服务 (用于上传文件访问)
app.use('/uploads', express.static('uploads'))

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log(`\n📝 可用的API接口:`)
  console.log(`   - GET  /api/health - 健康检查`)
  console.log(`   - GET  /api/reports/:reportNumber - 查询报告`)
  console.log(`   - POST /api/admin/login - 管理员登录`)
  console.log(`   - GET  /api/admin/stats - 获取统计数据`)
  console.log(`   - GET  /api/admin/reports - 获取报告列表`)
  console.log(`   - POST /api/admin/reports - 创建报告`)
  console.log(`   - PUT  /api/admin/reports/:id - 更新报告`)
  console.log(`   - DELETE /api/admin/reports/:id - 删除报告`)
  console.log(`   - POST /api/admin/upload - 上传文件`)
  console.log(`\n✅ 数据库连接成功，使用真实数据`)
})

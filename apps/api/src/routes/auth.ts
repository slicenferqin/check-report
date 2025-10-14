import { Router, type Router as ExpressRouter } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const router: ExpressRouter = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

// 管理员登录
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    // 从数据库查询管理员
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
      { expiresIn: '7d' }
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

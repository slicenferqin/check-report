import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// 查询报告 (公众接口)
router.get('/reports/:reportNumber', async (req, res) => {
  try {
    const { reportNumber } = req.params

    if (!reportNumber || reportNumber.trim() === '') {
      return res.status(400).json({ error: '报告编号不能为空' })
    }

    const report = await prisma.report.findUnique({
      where: { reportNumber: reportNumber.trim() }
    })

    if (!report) {
      return res.status(404).json({
        error: '未找到该报告,请确认报告编号是否正确'
      })
    }

    res.status(200).json(report)
  } catch (error) {
    console.error('报告查询失败:', error)
    res.status(500).json({ error: '服务器内部错误,请稍后重试' })
  }
})

export default router

import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// 获取统计数据
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

// 获取报告列表 (分页)
router.get('/admin/reports', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.report.count()
    ])

    res.status(200).json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取报告列表失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取单个报告
router.get('/admin/reports/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({ error: '无效的报告ID' })
    }

    const report = await prisma.report.findUnique({
      where: { id }
    })

    if (!report) {
      return res.status(404).json({ error: '报告不存在' })
    }

    res.status(200).json(report)
  } catch (error) {
    console.error('获取报告失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 创建报告
router.post('/admin/reports', authMiddleware, async (req, res) => {
  try {
    const {
      reportNumber,
      reportType,
      inspectionDate,
      equipmentName,
      clientCompany,
      userCompany,
      fileUrl,
      fileType
    } = req.body

    // 验证必填字段
    if (!reportNumber || !reportType || !inspectionDate || !equipmentName ||
        !clientCompany || !userCompany || !fileUrl || !fileType) {
      return res.status(400).json({ error: '缺少必填字段' })
    }

    // 检查报告编号是否已存在
    const existing = await prisma.report.findUnique({
      where: { reportNumber }
    })

    if (existing) {
      return res.status(409).json({ error: '报告编号已存在' })
    }

    const newReport = await prisma.report.create({
      data: {
        reportNumber,
        reportType,
        inspectionDate: new Date(inspectionDate),
        equipmentName,
        clientCompany,
        userCompany,
        fileUrl,
        fileType
      }
    })

    res.status(201).json(newReport)
  } catch (error) {
    console.error('创建报告失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新报告
router.put('/admin/reports/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({ error: '无效的报告ID' })
    }

    const {
      reportNumber,
      reportType,
      inspectionDate,
      equipmentName,
      clientCompany,
      userCompany,
      fileUrl,
      fileType
    } = req.body

    // 检查报告是否存在
    const existing = await prisma.report.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ error: '报告不存在' })
    }

    // 如果修改了报告编号，检查新编号是否已被使用
    if (reportNumber && reportNumber !== existing.reportNumber) {
      const duplicate = await prisma.report.findUnique({
        where: { reportNumber }
      })

      if (duplicate) {
        return res.status(409).json({ error: '报告编号已存在' })
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        ...(reportNumber && { reportNumber }),
        ...(reportType && { reportType }),
        ...(inspectionDate && { inspectionDate: new Date(inspectionDate) }),
        ...(equipmentName && { equipmentName }),
        ...(clientCompany && { clientCompany }),
        ...(userCompany && { userCompany }),
        ...(fileUrl && { fileUrl }),
        ...(fileType && { fileType })
      }
    })

    res.status(200).json(updatedReport)
  } catch (error) {
    console.error('更新报告失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 删除报告
router.delete('/admin/reports/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({ error: '无效的报告ID' })
    }

    // 检查报告是否存在
    const existing = await prisma.report.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ error: '报告不存在' })
    }

    await prisma.report.delete({
      where: { id }
    })

    res.status(200).json({ message: '报告删除成功' })
  } catch (error) {
    console.error('删除报告失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 上传文件 (真实文件上传)
router.post('/admin/upload', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' })
    }

    // 获取文件相对路径
    const relativePath = req.file.path.replace(process.cwd() + '/uploads/', '')

    // 判断文件类型
    let fileType: 'PDF' | 'JPG' | 'PNG' = 'PDF'
    const ext = req.file.mimetype
    if (ext.includes('jpeg') || ext.includes('jpg')) {
      fileType = 'JPG'
    } else if (ext.includes('png')) {
      fileType = 'PNG'
    }

    res.status(200).json({
      fileUrl: relativePath,
      fileType
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router

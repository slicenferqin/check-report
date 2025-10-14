# Story 1.5: 文件上传服务集成

**Epic:** Epic 1 - 项目基础设施与核心数据模型

**优先级:** P1

**状态:** TODO

**依赖:** Story 1.4 完成

---

## 用户故事

作为一名**后端开发工程师**，
我想**实现本地文件上传功能**，
以便**管理员能够上传报告扫描件并获取文件 URL**。

**注意：** 根据技术架构文档，本项目使用本地文件系统存储，而非云对象存储（OSS）。

---

## Acceptance Criteria

1. ✅ 配置本地文件存储目录（`uploads/reports/`）
2. ✅ 实现文件上传工具模块，封装 Multer 的上传操作
3. ✅ 实现 `POST /api/admin/upload` 接口，接收文件上传（multipart/form-data）
4. ✅ 接口必须包含身份认证中间件，验证 JWT Token
5. ✅ 验证上传文件的类型（只允许 PDF、JPG、PNG），大小不超过 10MB
6. ✅ 文件验证通过后，保存到本地目录，使用 UUID 或时间戳生成唯一文件名
7. ✅ 上传成功后，返回 200 状态码和文件相对路径 `{ "file_url": "reports/2023/04/xxx.pdf", "file_type": "PDF" }`
8. ✅ 文件类型或大小不符合要求时，返回 400 状态码和错误信息
9. ✅ 文件保存失败时，返回 500 状态码和错误信息
10. ✅ 编写单元测试或集成测试，模拟文件上传流程
11. ✅ 更新 API 文档，说明文件上传的格式和限制

---

## 技术要点

### API 规格
```
POST /api/admin/upload
Headers:
  Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

【请求体】
FormData:
  file: <binary file> (字段名: file)

【响应格式】
成功 (200):
{
  "fileUrl": "reports/2025/10/1728888888888-abc123.pdf",
  "fileType": "PDF"
}

文件类型错误 (400):
{
  "error": "只支持 PDF、JPG、PNG 格式"
}

文件过大 (400):
{
  "error": "文件大小不能超过 10MB"
}

未授权 (401):
{
  "error": "未授权,请先登录"
}

服务器错误 (500):
{
  "error": "文件上传失败"
}
```

### 实现示例

#### 文件上传配置
```typescript
// apps/api/src/utils/upload.ts
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'uploads', 'reports')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 按年月组织文件
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dir = path.join(uploadDir, String(year), month)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const timestamp = Date.now()
    const uuid = uuidv4().slice(0, 8)
    cb(null, `${timestamp}-${uuid}${ext}`)
  }
})

// 文件过滤
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('只支持 PDF、JPG、PNG 格式'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})
```

#### 上传接口
```typescript
// apps/api/src/routes/admin.ts
import { authMiddleware } from '../middleware/auth'
import { upload } from '../utils/upload'

router.post('/admin/upload', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未选择文件' })
    }

    // 计算相对路径
    const relativePath = path.relative(
      path.join(process.cwd(), 'uploads'),
      req.file.path
    )

    // 确定文件类型
    const fileType = req.file.mimetype === 'application/pdf' ? 'PDF' :
                    req.file.mimetype === 'image/jpeg' ? 'JPG' : 'PNG'

    res.status(200).json({
      fileUrl: relativePath.replace(/\\/g, '/'), // 统一使用正斜杠
      fileType
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    res.status(500).json({ error: '文件上传失败' })
  }
})

// 错误处理中间件
app.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小不能超过 10MB' })
    }
  }
  if (error.message === '只支持 PDF、JPG、PNG 格式') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
})
```

---

## 任务拆解

- [ ] 安装依赖 (`multer`, `uuid`)
- [ ] 创建 `src/utils/upload.ts` 文件上传工具
- [ ] 配置文件存储目录和规则
- [ ] 实现文件类型和大小验证
- [ ] 实现 `POST /admin/upload` 接口
- [ ] 添加错误处理中间件
- [ ] 配置静态文件服务（用于下载已上传文件）
- [ ] 编写单元测试
- [ ] 手动测试（Postman/cURL）
- [ ] 更新 API 文档

---

## 验收测试

### 准备测试文件
创建测试 PDF、JPG、PNG 文件。

### cURL 测试

**成功上传 PDF:**
```bash
curl -X POST http://localhost:3000/api/admin/upload \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@test-report.pdf"
# 应该返回 200 和文件路径
```

**上传图片:**
```bash
curl -X POST http://localhost:3000/api/admin/upload \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@test-image.jpg"
# 应该返回 200 和文件路径
```

**文件类型错误:**
```bash
curl -X POST http://localhost:3000/api/admin/upload \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@test.txt"
# 应该返回 400 和类型错误
```

**文件过大:**
```bash
# 创建一个 > 10MB 的文件
dd if=/dev/zero of=large.pdf bs=1M count=11
curl -X POST http://localhost:3000/api/admin/upload \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@large.pdf"
# 应该返回 400 和大小错误
```

### 验证文件存储
```bash
ls -lh uploads/reports/2025/10/
# 应该看到上传的文件
```

### 配置静态文件服务
```typescript
// apps/api/src/index.ts
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
```

然后访问:
```bash
curl http://localhost:3000/uploads/reports/2025/10/1728888888888-abc123.pdf
# 应该能下载文件
```

---

## 参考文档

- [architecture.md](../architecture.md) - 架构设计（文件存储章节）
- [Multer Documentation](https://github.com/expressjs/multer)
- [Node.js File System](https://nodejs.org/api/fs.html)

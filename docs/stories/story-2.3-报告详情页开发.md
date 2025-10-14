# Story 2.3: 报告详情页开发

**Epic:** Epic 2 - 公众官网与报告查询功能

**优先级:** P0

**状态:** TODO

**依赖:** Story 2.2 完成

---

## 用户故事

作为一名**工地质检人员**,
我想**查看报告的详细信息和扫描件**,
以便**验证报告的真实性并下载报告备份**。

---

## Acceptance Criteria

1. ✅ 实现报告详情页路由 (`/reports/:reportNumber`)
2. ✅ 页面显示报告的所有元数据字段:
   - 报告编号
   - 报告类型
   - 检测日期
   - 设备名称
   - 委托单位
   - 使用单位
3. ✅ 页面包含报告扫描件的预览区域:
   - 如果文件类型为 PDF,使用 PDF 预览插件 (如 `react-pdf`)
   - 如果文件类型为图片 (JPG、PNG),直接显示图片
4. ✅ 页面包含"下载报告"按钮,点击后下载文件到本地
5. ✅ 页面采用响应式设计,在移动端和桌面端均能良好显示
6. ✅ 移动端优化:预览区域占据适当空间,避免过度缩放
7. ✅ 处理文件加载失败的情况,显示"文件加载失败"提示
8. ✅ 页面包含"返回首页"或"重新查询"按钮,方便用户继续查询
9. ✅ 测试不同文件类型 (PDF、JPG、PNG) 的预览效果
10. ✅ 测试下载功能,确保文件能够正常下载并保留原始文件名

---

## 技术要点

### 页面结构
```
ReportDetailPage
├── Header (简化版,带返回按钮)
├── ReportInfo (报告元数据)
├── ReportPreview (文件预览)
│   ├── PDFViewer (PDF预览)
│   └── ImageViewer (图片预览)
└── ActionButtons (下载、返回)
```

### PDF 预览
```typescript
// 安装依赖
npm install react-pdf pdfjs-dist

// src/components/PDFViewer.tsx
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export const PDFViewer = ({ fileUrl }: { fileUrl: string }) => {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)

  return (
    <div className="pdf-viewer">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <div className="controls">
        <button disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)}>
          上一页
        </button>
        <span>第 {pageNumber} / {numPages} 页</span>
        <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(pageNumber + 1)}>
          下一页
        </button>
      </div>
    </div>
  )
}
```

### 文件下载
```typescript
// src/utils/download.ts
export const downloadFile = (fileUrl: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 在组件中使用
const handleDownload = () => {
  const fileName = `${report.reportNumber}.${report.fileType.toLowerCase()}`
  downloadFile(`${API_BASE_URL}/uploads/${report.fileUrl}`, fileName)
}
```

### 组件实现
```typescript
// src/pages/ReportDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Descriptions, Spin } from 'antd'
import { DownloadOutlined, HomeOutlined } from '@ant-design/icons'

export const ReportDetailPage = () => {
  const { reportNumber } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 从路由 state 获取数据,或重新请求
    const loadReport = async () => {
      try {
        const data = await reportApi.queryReport(reportNumber)
        setReport(data)
      } catch (error) {
        message.error('加载报告失败')
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [reportNumber])

  if (loading) return <Spin size="large" />

  return (
    <div className="report-detail-page">
      <Card title="报告详情">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="报告编号">{report.reportNumber}</Descriptions.Item>
          <Descriptions.Item label="报告类型">{report.reportType}</Descriptions.Item>
          <Descriptions.Item label="检测日期">{report.inspectionDate}</Descriptions.Item>
          <Descriptions.Item label="设备名称">{report.equipmentName}</Descriptions.Item>
          <Descriptions.Item label="委托单位">{report.clientCompany}</Descriptions.Item>
          <Descriptions.Item label="使用单位">{report.userCompany}</Descriptions.Item>
        </Descriptions>

        <div className="preview-section">
          {report.fileType === 'PDF' ? (
            <PDFViewer fileUrl={`/uploads/${report.fileUrl}`} />
          ) : (
            <img src={`/uploads/${report.fileUrl}`} alt="报告扫描件" />
          )}
        </div>

        <div className="actions">
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            下载报告
          </Button>
          <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

---

## 任务拆解

- [ ] 安装 `react-pdf` 依赖
- [ ] 创建 `src/pages/ReportDetailPage.tsx`
- [ ] 创建 `src/components/PDFViewer.tsx`
- [ ] 创建 `src/components/ImageViewer.tsx`
- [ ] 创建 `src/utils/download.ts` 下载工具
- [ ] 实现报告元数据展示 (Ant Design Descriptions)
- [ ] 实现文件预览逻辑 (根据文件类型选择组件)
- [ ] 实现下载功能
- [ ] 实现返回首页功能
- [ ] 响应式样式调整
- [ ] 测试不同文件类型预览
- [ ] 测试下载功能

---

## 验收测试

### PDF 预览测试
```
1. 查询一个 PDF 类型的报告
2. 进入详情页
3. 验证: PDF 正确显示
4. 验证: 可以翻页
5. 点击下载按钮
6. 验证: 文件成功下载,文件名正确
```

### 图片预览测试
```
1. 查询一个 JPG/PNG 类型的报告
2. 进入详情页
3. 验证: 图片正确显示
4. 验证: 图片清晰,不失真
5. 点击下载按钮
6. 验证: 文件成功下载
```

### 响应式测试
```
桌面端 (1920x1080):
- 报告信息和预览区域左右布局
- PDF/图片宽度适中

移动端 (375x667):
- 报告信息和预览区域上下布局
- PDF/图片宽度占满屏幕
- 字体大小合适
```

### 错误处理测试
```
1. 修改 URL 中的 reportNumber 为不存在的编号
2. 验证: 显示错误提示
3. 模拟文件 URL 失效
4. 验证: 显示"文件加载失败"提示
```

---

## 参考文档

- [ui-ux-design.md](../ui-ux-design.md) - UI 设计文档
- [react-pdf Documentation](https://github.com/wojtekmaj/react-pdf)
- [Ant Design Descriptions](https://ant.design/components/descriptions)

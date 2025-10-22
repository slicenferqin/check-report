import { useState } from 'react'
import { Image, Alert, Spin, Card } from 'antd'
import { FileTextOutlined, FileExcelOutlined, FileWordOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons'

interface InlineFilePreviewProps {
  fileUrl: string
  fileType: 'PDF' | 'JPG' | 'PNG' | 'DOCX' | 'DOC' | 'XLSX' | 'XLS'
  fileName: string
}

export const InlineFilePreview = ({ fileUrl, fileType, fileName }: InlineFilePreviewProps) => {
  const [loading, setLoading] = useState(true)

  // 获取完整的文件 URL
  const getFullFileUrl = () => {
    if (fileUrl.startsWith('http')) {
      return fileUrl
    }

    // 使用后端 API 地址（开发环境和生产环境）
    const apiBaseUrl = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:3001/'
    return `${apiBaseUrl}${fileUrl}`
  }

  const fullFileUrl = getFullFileUrl()

  // 获取文件类型图标
  const getFileIcon = () => {
    switch (fileType) {
      case 'PDF':
        return <FilePdfOutlined className="text-red-500 text-xl" />
      case 'JPG':
      case 'PNG':
        return <FileImageOutlined className="text-blue-500 text-xl" />
      case 'DOCX':
      case 'DOC':
        return <FileWordOutlined className="text-blue-600 text-xl" />
      case 'XLSX':
      case 'XLS':
        return <FileExcelOutlined className="text-green-600 text-xl" />
      default:
        return <FileTextOutlined className="text-xl" />
    }
  }

  // 根据文件类型渲染不同的预览内容
  const renderPreview = () => {
    switch (fileType) {
      case 'PDF':
        return (
          <div className="relative w-full h-full">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <Spin size="large" tip="加载 PDF 中..." />
              </div>
            )}
            <iframe
              src={fullFileUrl}
              className="w-full h-full border-0 rounded"
              title={fileName}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
        )

      case 'JPG':
      case 'PNG':
        return (
          <div className="flex justify-center items-center h-full bg-gray-50 overflow-auto rounded">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spin size="large" tip="加载图片中..." />
              </div>
            )}
            <Image
              src={fullFileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
              preview={{
                mask: '点击查看大图'
              }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
        )

      case 'DOCX':
      case 'DOC':
      case 'XLSX':
      case 'XLS':
        // 使用微软 Office Online Viewer 预览
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullFileUrl)}`
        return (
          <div className="h-full flex flex-col">
            <Alert
              message="Office 文档在线预览"
              description="使用微软 Office Online 服务预览文档，首次加载可能需要 5-10 秒"
              type="info"
              showIcon
              className="mb-3"
            />
            <div className="relative flex-1">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                  <Spin size="large" tip="正在加载 Office 文档..." />
                </div>
              )}
              <iframe
                src={officeViewerUrl}
                className="w-full h-full border-0 rounded"
                title={fileName}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            </div>
          </div>
        )

      default:
        return (
          <Alert
            message="不支持的文件类型"
            description={`文件类型 ${fileType} 暂不支持在线预览，请下载后查看`}
            type="warning"
            showIcon
          />
        )
    }
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          {getFileIcon()}
          <span className="font-medium">文件预览</span>
          <span className="text-sm text-gray-500 font-normal">({fileName})</span>
        </div>
      }
      className="shadow-sm"
      bodyStyle={{ padding: 0, height: '600px' }}
    >
      <div className="h-full p-4">
        {renderPreview()}
      </div>
    </Card>
  )
}

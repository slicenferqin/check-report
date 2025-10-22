import { useState } from 'react'
import { Modal, Image, Alert, Spin } from 'antd'
import { FileTextOutlined, FileExcelOutlined, FileWordOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons'

interface FilePreviewProps {
  fileUrl: string
  fileType: 'PDF' | 'JPG' | 'PNG' | 'DOCX' | 'DOC' | 'XLSX' | 'XLS'
  fileName: string
  visible: boolean
  onClose: () => void
}

export const FilePreview = ({ fileUrl, fileType, fileName, visible, onClose }: FilePreviewProps) => {
  const [loading, setLoading] = useState(true)

  // 获取完整的文件 URL
  // 使用后端服务地址，避免被前端路由拦截
  const getFullFileUrl = () => {
    if (fileUrl.startsWith('http')) {
      return fileUrl
    }

    // 使用后端 API 地址（开发环境和生产环境）
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
    const backendUrl = apiBaseUrl.replace('/api', '')
    return `${backendUrl}${fileUrl}`
  }

  const fullFileUrl = getFullFileUrl()

  // 根据文件类型渲染不同的预览内容
  const renderPreview = () => {
    switch (fileType) {
      case 'PDF':
        return (
          <div className="relative w-full" style={{ height: '70vh' }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <Spin size="large" tip="加载中..." />
              </div>
            )}
            <iframe
              src={fullFileUrl}
              className="w-full h-full border-0"
              title={fileName}
              onLoad={() => setLoading(false)}
            />
          </div>
        )

      case 'JPG':
      case 'PNG':
        return (
          <div className="flex justify-center items-center p-4">
            <Image
              src={fullFileUrl}
              alt={fileName}
              className="max-w-full"
              preview={false}
              onLoad={() => setLoading(false)}
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
          <div className="space-y-4">
            <Alert
              message="Office 文档预览"
              description={
                <div>
                  <p>使用微软 Office Online 服务预览文档。</p>
                  <p className="text-xs text-gray-500 mt-1">
                    如果预览失败，请检查：
                    <br />1. 文件格式是否正确
                    <br />2. 文件 URL 是否可公网访问
                  </p>
                </div>
              }
              type="info"
              showIcon
            />
            <div className="relative w-full" style={{ height: '60vh' }}>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <Spin size="large" tip="正在加载 Office 文档..." />
                </div>
              )}
              <iframe
                src={officeViewerUrl}
                className="w-full h-full border-0"
                title={fileName}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false)
                }}
              />
            </div>
          </div>
        )

      default:
        return (
          <Alert
            message="不支持的文件类型"
            description={`文件类型 ${fileType} 暂不支持预览`}
            type="warning"
            showIcon
          />
        )
    }
  }

  // 获取文件图标
  const getFileIcon = () => {
    switch (fileType) {
      case 'PDF':
        return <FilePdfOutlined className="text-red-500" />
      case 'JPG':
      case 'PNG':
        return <FileImageOutlined className="text-blue-500" />
      case 'DOCX':
      case 'DOC':
        return <FileWordOutlined className="text-blue-600" />
      case 'XLSX':
      case 'XLS':
        return <FileExcelOutlined className="text-green-600" />
      default:
        return <FileTextOutlined />
    }
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          {getFileIcon()}
          <span>{fileName}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      destroyOnClose
    >
      {renderPreview()}
    </Modal>
  )
}

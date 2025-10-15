import { useState } from 'react'
import { Input, Button, message } from 'antd'
import {
  SearchOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { reportApi } from '../services/api'
import { siteConfig } from '../config/site'

// 导入图片资源
import logo from '/logo.png'
import heroBg from '../assets/images/hero-bg.png'
import craneImg from '../assets/images/services/crane.jpeg'
import earthworkImg from '../assets/images/services/earthwork.jpeg'
import pileImg from '../assets/images/services/pile.jpeg'
import cnasImg from '../assets/images/certificates/cnas.jpg'

export const HomePage = () => {
  const [reportNumber, setReportNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!reportNumber.trim()) {
      message.warning('请输入报告编号')
      return
    }

    setLoading(true)
    try {
      const report = await reportApi.queryReport(reportNumber.trim())
      navigate(`/reports/${reportNumber}`, { state: { report } })
    } catch (error: any) {
      console.error('查询报告失败:', error)
      if (error.response?.status === 404) {
        const errorMsg = error.response?.data?.error || '未找到该报告,请确认报告编号是否正确'
        message.error(errorMsg)
      } else if (error.response?.data?.error) {
        message.error(error.response.data.error)
      } else if (error.code === 'ERR_NETWORK') {
        message.error('网络连接失败,请检查网络后重试')
      } else {
        message.error('查询失败,请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header - 专业黑色头部 */}
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="公司Logo" className="h-14 w-auto object-contain" />
              <div className="border-l border-gray-700 pl-4">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  {siteConfig.companyName}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">专业检测 · 权威认证</p>
              </div>
            </div>
            <a
              href="/admin/login"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            >
              <span>管理后台</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - 报告查询区域 */}
      <section
        className="relative py-32 sm:py-40 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(30, 58, 138, 0.85)), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* 网格背景效果 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* 光晕效果 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px]"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 认证标识 */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full">
              <SafetyCertificateOutlined className="text-blue-400 text-lg" />
              <span className="text-blue-200 text-sm font-medium">CMA资质认证</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full">
              <TrophyOutlined className="text-blue-400 text-lg" />
              <span className="text-blue-200 text-sm font-medium">CNAS实验室认可</span>
            </div>
          </div>

          <h2 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
            检测报告在线查询
          </h2>
          <p className="text-2xl text-blue-100 mb-14 max-w-3xl mx-auto font-light">
            专业 · 快速 · 权威的检测报告验证服务
          </p>

          {/* 查询框 */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <Input
                  size="large"
                  placeholder="请输入报告编号，如：ZJW20230145"
                  value={reportNumber}
                  onChange={(e) => setReportNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  prefix={<SearchOutlined className="text-blue-500 text-xl" />}
                  className="flex-1 text-lg rounded-xl border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500"
                  style={{ height: '60px', fontSize: '16px' }}
                />
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={handleSearch}
                  icon={<SearchOutlined />}
                  className="w-full sm:w-36 text-base font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl"
                  style={{ height: '60px' }}
                >
                  {loading ? '查询中' : '立即查询'}
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
                <CheckCircleOutlined className="text-blue-600" />
                <span className="text-sm font-medium">支持检测合格证和安装委托检验报告查询</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 公司简介 - 黑色背景专业版 */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
              <span className="text-blue-400 text-sm font-semibold tracking-wider">ABOUT US</span>
            </div>
            <h3 className="text-5xl font-black text-white mb-4">
              关于我们
            </h3>
            <p className="text-xl text-gray-400">权威认证 · 值得信赖</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* 专业资质 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/50">
                <SafetyCertificateOutlined className="text-white text-4xl" />
              </div>
              <h4 className="text-3xl font-bold text-white mb-6">专业资质</h4>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                {siteConfig.companyName}是一家专业从事建筑机械设备检测的第三方检测机构，
                具备<span className="font-bold text-blue-400">CMA资质认定</span>和
                <span className="font-bold text-blue-400">CNAS实验室认可资质</span>。
              </p>
            </div>

            {/* CNAS认证图片展示 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="relative overflow-hidden rounded-2xl mb-8 bg-white p-6 shadow-xl">
                <img
                  src={cnasImg}
                  alt="CNAS认证"
                  className="w-full h-auto object-contain"
                />
              </div>
              <h4 className="text-3xl font-bold text-white mb-4">权威认证</h4>
              <p className="text-gray-300 leading-relaxed text-lg">
                通过国家级实验室认可，检测结果国际互认，为客户提供最权威的检测报告。
              </p>
            </div>

            {/* 服务承诺 */}
            <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/50">
                <CustomerServiceOutlined className="text-white text-4xl" />
              </div>
              <h4 className="text-3xl font-bold text-white mb-6">服务承诺</h4>
              <p className="text-gray-300 leading-relaxed text-lg">
                我们致力于为客户提供<span className="font-bold text-green-400">准确、公正、及时</span>的检测服务，
                确保建筑机械设备的安全运行，守护每一个工程项目。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 服务范围 - 使用真实图片 */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
              <span className="text-blue-400 text-sm font-semibold tracking-wider">OUR SERVICES</span>
            </div>
            <h3 className="text-5xl font-black text-white mb-4">
              服务范围
            </h3>
            <p className="text-xl text-gray-400">全方位检测解决方案</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* 起重机械检测 */}
            <div className="group relative bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={craneImg}
                  alt="起重机械检测"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <SafetyCertificateOutlined className="text-white text-2xl" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">
                    起重机械检测
                  </h4>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  塔式起重机、施工升降机、物料提升机等设备的安装验收和定期检验
                </p>
              </div>
            </div>

            {/* 土方机械检测 */}
            <div className="group relative bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/30 hover:scale-105">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={earthworkImg}
                  alt="土方机械检测"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50">
                    <CheckCircleOutlined className="text-white text-2xl" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">
                    土方机械检测
                  </h4>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  挖掘机、装载机、推土机等土方机械的性能检测和安全评估
                </p>
              </div>
            </div>

            {/* 桩工机械检测 */}
            <div className="group relative bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 hover:border-orange-500 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={pileImg}
                  alt="桩工机械检测"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50">
                    <TrophyOutlined className="text-white text-2xl" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">
                    桩工机械检测
                  </h4>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  旋挖钻机、冲孔桩机等桩工机械的安全性能检测
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 联系方式 - 黑色背景专业版 */}
      <section className="py-24 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
        {/* 装饰背景 */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
              <span className="text-blue-400 text-sm font-semibold tracking-wider">CONTACT US</span>
            </div>
            <h3 className="text-5xl font-black text-white mb-4">
              联系我们
            </h3>
            <p className="text-xl text-gray-400">随时为您提供专业咨询服务</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {/* 联系电话 */}
              <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border-2 border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/50">
                  <PhoneOutlined className="text-white text-3xl" />
                </div>
                <p className="text-gray-400 text-sm font-medium mb-3 tracking-wider">联系电话</p>
                <p className="text-2xl font-bold text-white">{siteConfig.contact.phone}</p>
              </div>

              {/* 电子邮箱 */}
              <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border-2 border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/50">
                  <MailOutlined className="text-white text-3xl" />
                </div>
                <p className="text-gray-400 text-sm font-medium mb-3 tracking-wider">电子邮箱</p>
                <p className="text-xl font-bold text-white break-all">{siteConfig.contact.email}</p>
              </div>

              {/* 公司地址 */}
              <div className="group bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border-2 border-gray-700 hover:border-orange-500 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/50">
                  <EnvironmentOutlined className="text-white text-3xl" />
                </div>
                <p className="text-gray-400 text-sm font-medium mb-3 tracking-wider">公司地址</p>
                <p className="text-lg font-bold text-white leading-relaxed">{siteConfig.contact.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - 深色专业页脚 */}
      <footer className="bg-black/95 text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo 和公司名 */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <img src={logo} alt="公司Logo" className="h-12 w-auto object-contain" />
              <div className="border-l border-gray-700 pl-4">
                <h4 className="text-2xl font-bold text-white">{siteConfig.companyName}</h4>
                <p className="text-xs text-gray-500 mt-1">专业检测 · 权威认证</p>
              </div>
            </div>

            {/* 认证标识 */}
            <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-full">
                <SafetyCertificateOutlined className="text-blue-400" />
                <span className="text-gray-400 text-xs">CMA资质认证</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-full">
                <TrophyOutlined className="text-blue-400" />
                <span className="text-gray-400 text-xs">CNAS实验室认可</span>
              </div>
            </div>

            {/* 版权信息 */}
            <div className="border-t border-gray-900 pt-8">
              <p className="text-gray-500 mb-2">
                &copy; 2025 {siteConfig.companyName}. All rights reserved.
              </p>
              <p className="text-gray-600 text-sm">{siteConfig.icp}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

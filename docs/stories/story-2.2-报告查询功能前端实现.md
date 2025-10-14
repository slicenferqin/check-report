# Story 2.2: 报告查询功能前端实现

**Epic:** Epic 2 - 公众官网与报告查询功能

**优先级:** P0

**状态:** TODO

**依赖:** Story 1.3 (报告查询API) 和 Story 2.1 (官网首页) 完成

---

## 用户故事

作为一名**工地质检人员**,
我想**在官网首页输入报告编号并点击查询**,
以便**快速找到对应的检测报告**。

---

## Acceptance Criteria

1. ✅ 实现报告查询输入框和查询按钮的交互逻辑
2. ✅ 用户输入报告编号后,点击查询按钮,前端发起 API 请求 `GET /api/reports/:reportNumber`
3. ✅ 查询过程中,显示 Loading 状态(如加载动画或按钮禁用)
4. ✅ 查询成功时,跳转到报告详情页,展示报告信息
5. ✅ 查询失败时(报告不存在),在首页显示错误提示信息:"未找到该报告,请确认报告编号是否正确"
6. ✅ 网络错误或服务器错误时,显示通用错误提示:"查询失败,请稍后重试"
7. ✅ 输入框为空时,点击查询按钮,提示用户"请输入报告编号"
8. ✅ 支持键盘 Enter 键触发查询操作
9. ✅ 测试查询功能在移动端和桌面端的交互体验
10. ✅ 编写前端单元测试或 E2E 测试,覆盖成功查询、报告不存在、输入为空等场景

---

## 技术要点

### API 接口
```typescript
// src/services/api.ts
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const reportApi = {
  queryReport: async (reportNumber: string) => {
    const response = await axios.get(`${API_BASE_URL}/reports/${reportNumber}`)
    return response.data
  }
}
```

### 组件实现
```typescript
// src/components/HeroSection.tsx
import { useState } from 'react'
import { Input, Button, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { reportApi } from '../services/api'

export const HeroSection = () => {
  const [reportNumber, setReportNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async () => {
    // 输入验证
    if (!reportNumber.trim()) {
      message.warning('请输入报告编号')
      return
    }

    setLoading(true)
    try {
      const report = await reportApi.queryReport(reportNumber.trim())
      // 跳转到报告详情页
      navigate(`/reports/${reportNumber}`, { state: { report } })
    } catch (error: any) {
      if (error.response?.status === 404) {
        message.error('未找到该报告,请确认报告编号是否正确')
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
    <div className="hero-section">
      <h1>报告查询</h1>
      <div className="search-box">
        <Input
          size="large"
          placeholder="请输入报告编号"
          value={reportNumber}
          onChange={(e) => setReportNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          prefix={<SearchOutlined />}
        />
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={handleSearch}
        >
          查询
        </Button>
      </div>
    </div>
  )
}
```

---

## 任务拆解

- [ ] 创建 `src/services/api.ts` API 请求封装
- [ ] 配置 Axios 拦截器 (错误处理)
- [ ] 创建环境变量配置 `.env.development` 和 `.env.production`
- [ ] 更新 `HeroSection` 组件实现查询逻辑
- [ ] 实现 Loading 状态
- [ ] 实现错误提示 (使用 Ant Design message)
- [ ] 实现键盘 Enter 事件
- [ ] 配置路由 (React Router)
- [ ] 编写单元测试 (Vitest + React Testing Library)
- [ ] 编写 E2E 测试 (Playwright/Cypress)
- [ ] 测试移动端和桌面端交互

---

## 验收测试

### 功能测试

**成功查询:**
```
1. 打开首页
2. 输入报告编号: ZJW20230145
3. 点击查询按钮
4. 验证: 页面跳转到 /reports/ZJW20230145
5. 验证: 显示报告详情
```

**报告不存在:**
```
1. 输入不存在的报告编号: NONEXIST
2. 点击查询
3. 验证: 显示错误提示 "未找到该报告,请确认报告编号是否正确"
4. 验证: 不跳转页面
```

**输入为空:**
```
1. 不输入任何内容
2. 点击查询
3. 验证: 显示提示 "请输入报告编号"
```

**Enter键查询:**
```
1. 输入报告编号
2. 按 Enter 键
3. 验证: 触发查询操作
```

### 单元测试
```typescript
// src/components/__tests__/HeroSection.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HeroSection } from '../HeroSection'
import { reportApi } from '../../services/api'

jest.mock('../../services/api')

describe('HeroSection', () => {
  it('should show error when input is empty', async () => {
    render(<HeroSection />)
    const button = screen.getByText('查询')
    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByText('请输入报告编号')).toBeInTheDocument()
    })
  })

  it('should call API when search button is clicked', async () => {
    const mockReport = { reportNumber: 'ZJW20230145', ... }
    ;(reportApi.queryReport as jest.Mock).mockResolvedValue(mockReport)

    render(<HeroSection />)
    const input = screen.getByPlaceholderText('请输入报告编号')
    const button = screen.getByText('查询')

    fireEvent.change(input, { target: { value: 'ZJW20230145' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(reportApi.queryReport).toHaveBeenCalledWith('ZJW20230145')
    })
  })
})
```

---

## 参考文档

- [api-design.md](../api-design.md) - API 接口文档
- [Ant Design Message](https://ant.design/components/message)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

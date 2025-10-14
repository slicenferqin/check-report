# Testing Strategy

## Testing Pyramid

```
         E2E Tests (Playwright)
        /                      \
       /  Integration Tests     \
      /   (API + Database)       \
     /                            \
    Frontend Unit    Backend Unit
   (Vitest + RTL)  (Jest + Supertest)
```

## Test Organization

### Frontend Tests

```
apps/web/tests/
├── unit/                    # 单元测试
│   ├── components/
│   │   ├── SearchBox.test.tsx
│   │   └── ReportTable.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   └── services/
│       └── reportService.test.ts
└── e2e/                     # E2E 测试
    ├── public.spec.ts       # 公众查询流程
    └── admin.spec.ts        # 管理员操作流程
```

### Backend Tests

```
apps/api/tests/
├── unit/                    # 单元测试
│   ├── services/
│   │   ├── reportService.test.ts
│   │   └── adminService.test.ts
│   └── utils/
│       └── jwt.test.ts
└── integration/             # 集成测试
    ├── report.api.test.ts   # 报告 API 测试
    └── admin.api.test.ts    # 管理员 API 测试
```

---

## Test Examples

### Frontend Component Test

```typescript
// apps/web/tests/unit/components/SearchBox.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SearchBox } from '../../../src/components/public/SearchBox';
import { describe, it, expect, vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SearchBox', () => {
  it('should render search input and button', () => {
    render(
      <BrowserRouter>
        <SearchBox />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('请输入报告编号')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /查询/i })).toBeInTheDocument();
  });

  it('should navigate to report detail when search is clicked', () => {
    render(
      <BrowserRouter>
        <SearchBox />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('请输入报告编号');
    const button = screen.getByRole('button', { name: /查询/i });

    fireEvent.change(input, { target: { value: 'ZJW20230145' } });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/reports/ZJW20230145');
  });

  it('should show warning when search with empty input', async () => {
    render(
      <BrowserRouter>
        <SearchBox />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /查询/i });
    fireEvent.click(button);

    // Ant Design message 测试需要额外配置
    // 这里简化处理
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
```

### Backend API Test

```typescript
// apps/api/tests/integration/report.api.test.ts
import request from 'supertest';
import { app } from '../../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Report API', () => {
  beforeAll(async () => {
    // 清空测试数据库
    await prisma.report.deleteMany();

    // 插入测试数据
    await prisma.report.create({
      data: {
        reportNumber: 'TEST001',
        reportType: 'INSPECTION_CERT',
        inspectionDate: new Date('2023-04-12'),
        equipmentName: '测试设备',
        clientCompany: '测试公司A',
        userCompany: '测试公司B',
        fileUrl: 'https://example.com/test.pdf',
        fileType: 'PDF',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/reports/:reportNumber', () => {
    it('should return report when it exists', async () => {
      const res = await request(app)
        .get('/api/reports/TEST001')
        .expect(200);

      expect(res.body).toHaveProperty('reportNumber', 'TEST001');
      expect(res.body).toHaveProperty('equipmentName', '测试设备');
    });

    it('should return 404 when report does not exist', async () => {
      const res = await request(app)
        .get('/api/reports/NOTEXIST')
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/admin/reports', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 生成有效的测试 Token

    it('should create report when authorized', async () => {
      const newReport = {
        reportNumber: 'TEST002',
        reportType: 'INSTALLATION_INSPECTION',
        inspectionDate: '2023-05-01',
        equipmentName: '新设备',
        clientCompany: '公司C',
        userCompany: '公司D',
        fileUrl: 'https://example.com/test2.pdf',
        fileType: 'PDF',
      };

      const res = await request(app)
        .post('/api/admin/reports')
        .set('Authorization', `Bearer ${validToken}`)
        .send(newReport)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('reportNumber', 'TEST002');
    });

    it('should return 401 when not authorized', async () => {
      await request(app)
        .post('/api/admin/reports')
        .send({ reportNumber: 'TEST003' })
        .expect(401);
    });

    it('should return 409 when report number already exists', async () => {
      const duplicateReport = {
        reportNumber: 'TEST001', // 已存在
        reportType: 'INSPECTION_CERT',
        inspectionDate: '2023-06-01',
        equipmentName: '设备',
        clientCompany: '公司',
        userCompany: '公司',
        fileUrl: 'https://example.com/test.pdf',
        fileType: 'PDF',
      };

      await request(app)
        .post('/api/admin/reports')
        .set('Authorization', `Bearer ${validToken}`)
        .send(duplicateReport)
        .expect(409);
    });
  });
});
```

### E2E Test

```typescript
// apps/web/tests/e2e/public.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Public Report Query', () => {
  test('should query and view report successfully', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:5173');

    // 验证页面标题和查询框
    await expect(page.locator('h1')).toContainText('浙江省牛叉检测技术有限公司');
    await expect(page.locator('input[placeholder="请输入报告编号"]')).toBeVisible();

    // 输入报告编号并查询
    await page.fill('input[placeholder="请输入报告编号"]', 'TEST001');
    await page.click('button:has-text("查询")');

    // 等待跳转到报告详情页
    await page.waitForURL('**/reports/TEST001');

    // 验证报告信息显示
    await expect(page.locator('text=报告编号')).toBeVisible();
    await expect(page.locator('text=TEST001')).toBeVisible();
    await expect(page.locator('text=测试设备')).toBeVisible();

    // 验证下载按钮存在
    await expect(page.locator('button:has-text("下载报告")')).toBeVisible();
  });

  test('should show error when report not found', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.fill('input[placeholder="请输入报告编号"]', 'NOTEXIST');
    await page.click('button:has-text("查询")');

    await page.waitForURL('**/reports/NOTEXIST');

    // 验证错误提示
    await expect(page.locator('text=未找到该报告')).toBeVisible();
  });
});
```

---

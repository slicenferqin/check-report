# Data Models

## Report（报告）

**Purpose:** 存储检测报告的元数据信息，是系统的核心业务实体。

**Key Attributes:**
- `id`: number - 主键，自增 ID
- `reportNumber`: string - 报告编号（唯一索引）
- `reportType`: enum - 报告类型（'INSPECTION_CERT' | 'INSTALLATION_INSPECTION'）
- `inspectionDate`: Date - 检测日期
- `equipmentName`: string - 设备名称
- `clientCompany`: string - 委托单位
- `userCompany`: string - 使用单位
- `fileUrl`: string - 报告文件路径（相对于 uploads 目录）
- `fileType`: enum - 文件类型（'PDF' | 'JPG' | 'PNG'）
- `createdAt`: Date - 创建时间
- `updatedAt`: Date - 更新时间

### TypeScript Interface

```typescript
export enum ReportType {
  INSPECTION_CERT = 'INSPECTION_CERT',       // 检测合格证
  INSTALLATION_INSPECTION = 'INSTALLATION_INSPECTION' // 安装委托检验
}

export enum FileType {
  PDF = 'PDF',
  JPG = 'JPG',
  PNG = 'PNG'
}

export interface Report {
  id: number;
  reportNumber: string;
  reportType: ReportType;
  inspectionDate: Date;
  equipmentName: string;
  clientCompany: string;
  userCompany: string;
  fileUrl: string;
  fileType: FileType;
  createdAt: Date;
  updatedAt: Date;
}

// API 请求/响应类型
export interface CreateReportDto {
  reportNumber: string;
  reportType: ReportType;
  inspectionDate: string; // ISO 8601 格式
  equipmentName: string;
  clientCompany: string;
  userCompany: string;
  fileUrl: string;
  fileType: FileType;
}

export interface UpdateReportDto {
  reportType?: ReportType;
  inspectionDate?: string;
  equipmentName?: string;
  clientCompany?: string;
  userCompany?: string;
}

export interface ReportListQuery {
  page?: number;
  limit?: number;
  search?: string; // 搜索报告编号
}
```

### Relationships
- 无直接关联的其他实体（MVP 阶段）

---

## Admin（管理员）

**Purpose:** 存储管理员账号信息，用于后台登录认证。

**Key Attributes:**
- `id`: number - 主键，自增 ID
- `username`: string - 用户名（唯一）
- `passwordHash`: string - bcrypt 加密后的密码
- `createdAt`: Date - 创建时间

### TypeScript Interface

```typescript
export interface Admin {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

// API 请求/响应类型
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  expiresIn: number; // Token 有效期（秒）
}

export interface AdminPayload {
  id: number;
  username: string;
}
```

### Relationships
- 无直接关联的其他实体（MVP 阶段未实现操作日志等功能）

---

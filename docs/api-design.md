# API 接口设计文档

**项目名称：** 检测报告在线查询系统
**文档版本：** 1.0
**创建日期：** 2025-10-13
**API 风格：** RESTful API

---

## 目录

1. [接口概述](#接口概述)
2. [通用规范](#通用规范)
3. [公开接口](#公开接口)
4. [管理员接口](#管理员接口)
5. [错误码定义](#错误码定义)
6. [接口测试](#接口测试)

---

## 接口概述

### Base URL

```
开发环境: http://localhost:3000/api
生产环境: https://www.your-domain.com/api
```

### 接口分类

| 分类 | 路径前缀 | 认证要求 | 说明 |
|------|----------|----------|------|
| 系统接口 | `/` | 无 | 健康检查等 |
| 公开接口 | `/reports` | 无 | 报告查询 |
| 认证接口 | `/admin` | 部分 | 登录等 |
| 管理员接口 | `/admin/*` | 需要 | 报告管理 |

---

## 通用规范

### 请求规范

#### HTTP 方法

| 方法 | 说明 | 示例 |
|------|------|------|
| GET | 获取资源 | 查询报告列表 |
| POST | 创建资源 | 上传报告 |
| PUT | 更新资源 | 更新报告信息 |
| DELETE | 删除资源 | 删除报告 |

#### 请求头

```http
Content-Type: application/json
Authorization: Bearer {token}  // 管理员接口必需
```

#### 请求体格式

```json
{
  "key": "value"
}
```

### 响应规范

#### 响应头

```http
Content-Type: application/json
```

#### 成功响应格式

**单个资源：**
```json
{
  "id": 1,
  "reportNumber": "ZJW20230145",
  "reportType": "INSPECTION_CERT",
  "inspectionDate": "2023-04-12",
  "equipmentName": "挖掘机 XE60DA",
  "clientCompany": "杭州建设工程有限公司",
  "userCompany": "浙江建工集团",
  "fileUrl": "/uploads/reports/2023/04/ZJW20230145.pdf",
  "fileType": "PDF",
  "createdAt": "2023-04-12T08:30:00.000Z",
  "updatedAt": "2023-04-12T08:30:00.000Z"
}
```

**资源列表：**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### 错误响应格式

```json
{
  "error": "NOT_FOUND",
  "message": "未找到该报告，请确认报告编号是否正确",
  "timestamp": "2023-10-13T10:30:00.000Z",
  "requestId": "uuid-here"
}
```

### 状态码规范

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | 成功 | GET、PUT、DELETE 成功 |
| 201 | 创建成功 | POST 创建资源成功 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 未授权 | Token 无效或过期 |
| 403 | 禁止访问 | 无权限访问资源 |
| 404 | 未找到 | 资源不存在 |
| 409 | 冲突 | 资源重复（如报告编号已存在） |
| 500 | 服务器错误 | 服务器内部错误 |

---

## 公开接口

### 1. 健康检查

**接口说明：** 检查系统是否正常运行

```http
GET /health
```

**请求参数：** 无

**响应示例：**

```json
{
  "status": "ok",
  "timestamp": "2023-10-13T10:30:00.000Z"
}
```

**状态码：**
- 200: 系统正常

---

### 2. 查询报告（按报告编号）

**接口说明：** 公众用户通过报告编号查询报告详情

```http
GET /reports/:reportNumber
```

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| reportNumber | string | 是 | 报告编号 |

**请求示例：**

```http
GET /api/reports/ZJW20230145
```

**响应示例（成功）：**

```json
{
  "id": 1,
  "reportNumber": "ZJW20230145",
  "reportType": "INSPECTION_CERT",
  "inspectionDate": "2023-04-12",
  "equipmentName": "挖掘机 XE60DA",
  "clientCompany": "杭州建设工程有限公司",
  "userCompany": "浙江建工集团",
  "fileUrl": "/uploads/reports/2023/04/ZJW20230145.pdf",
  "fileType": "PDF",
  "createdAt": "2023-04-12T08:30:00.000Z",
  "updatedAt": "2023-04-12T08:30:00.000Z"
}
```

**响应示例（失败）：**

```json
{
  "error": "NOT_FOUND",
  "message": "未找到该报告，请确认报告编号是否正确",
  "timestamp": "2023-10-13T10:30:00.000Z",
  "requestId": "uuid-here"
}
```

**状态码：**
- 200: 查询成功
- 404: 报告不存在
- 500: 服务器错误

---

## 管理员接口

### 1. 管理员登录

**接口说明：** 管理员登录获取 Token

```http
POST /admin/login
```

**请求体：**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例：**

```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**响应示例（成功）：**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "expiresIn": 604800
}
```

**响应示例（失败）：**

```json
{
  "error": "UNAUTHORIZED",
  "message": "用户名或密码错误",
  "timestamp": "2023-10-13T10:30:00.000Z",
  "requestId": "uuid-here"
}
```

**状态码：**
- 200: 登录成功
- 401: 用户名或密码错误
- 400: 参数验证失败

---

### 2. 获取报告列表

**接口说明：** 管理员获取所有报告列表（分页）

```http
GET /admin/reports
```

**请求头：**

```http
Authorization: Bearer {token}
```

**查询参数：**

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| limit | number | 否 | 20 | 每页数量 |
| search | string | 否 | - | 搜索报告编号（模糊匹配） |

**请求示例：**

```http
GET /api/admin/reports?page=1&limit=20&search=ZJW
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例：**

```json
{
  "data": [
    {
      "id": 1,
      "reportNumber": "ZJW20230145",
      "reportType": "INSPECTION_CERT",
      "inspectionDate": "2023-04-12",
      "equipmentName": "挖掘机 XE60DA",
      "clientCompany": "杭州建设工程有限公司",
      "userCompany": "浙江建工集团",
      "fileUrl": "/uploads/reports/2023/04/ZJW20230145.pdf",
      "fileType": "PDF",
      "createdAt": "2023-04-12T08:30:00.000Z",
      "updatedAt": "2023-04-12T08:30:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**状态码：**
- 200: 查询成功
- 401: 未授权（Token 无效或过期）
- 500: 服务器错误

---

### 3. 上传文件

**接口说明：** 上传报告文件到服务器

```http
POST /admin/upload
```

**请求头：**

```http
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**请求体（FormData）：**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 报告文件（PDF、JPG、PNG） |

**请求示例（JavaScript）：**

```javascript
const formData = new FormData();
formData.append('file', fileObject);

fetch('/api/admin/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**响应示例（成功）：**

```json
{
  "fileUrl": "/uploads/reports/2023/10/uuid-filename.pdf",
  "fileType": "PDF",
  "fileSize": 1048576,
  "originalName": "report.pdf"
}
```

**响应示例（失败）：**

```json
{
  "error": "VALIDATION_ERROR",
  "message": "文件类型不支持，仅支持 PDF、JPG、PNG",
  "timestamp": "2023-10-13T10:30:00.000Z",
  "requestId": "uuid-here"
}
```

**状态码：**
- 200: 上传成功
- 400: 文件验证失败（类型或大小不符）
- 401: 未授权
- 500: 上传失败

**验证规则：**
- 文件类型：仅允许 PDF、JPG、PNG
- 文件大小：最大 10MB
- 文件名：自动生成 UUID + 原始扩展名

---

### 4. 创建报告记录

**接口说明：** 创建新的报告记录（配合文件上传使用）

```http
POST /admin/reports
```

**请求头：**

```http
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体：**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| reportNumber | string | 是 | 报告编号（唯一） |
| reportType | string | 是 | 报告类型（INSPECTION_CERT / INSTALLATION_INSPECTION） |
| inspectionDate | string | 是 | 检测日期（YYYY-MM-DD） |
| equipmentName | string | 是 | 设备名称 |
| clientCompany | string | 是 | 委托单位 |
| userCompany | string | 是 | 使用单位 |
| fileUrl | string | 是 | 文件路径（从上传接口获取） |
| fileType | string | 是 | 文件类型（PDF / JPG / PNG） |

**请求示例：**

```json
{
  "reportNumber": "ZJW20230145",
  "reportType": "INSPECTION_CERT",
  "inspectionDate": "2023-04-12",
  "equipmentName": "挖掘机 XE60DA",
  "clientCompany": "杭州建设工程有限公司",
  "userCompany": "浙江建工集团",
  "fileUrl": "/uploads/reports/2023/10/uuid-filename.pdf",
  "fileType": "PDF"
}
```

**响应示例（成功）：**

```json
{
  "id": 1,
  "reportNumber": "ZJW20230145",
  "reportType": "INSPECTION_CERT",
  "inspectionDate": "2023-04-12",
  "equipmentName": "挖掘机 XE60DA",
  "clientCompany": "杭州建设工程有限公司",
  "userCompany": "浙江建工集团",
  "fileUrl": "/uploads/reports/2023/10/uuid-filename.pdf",
  "fileType": "PDF",
  "createdAt": "2023-10-13T10:30:00.000Z",
  "updatedAt": "2023-10-13T10:30:00.000Z"
}
```

**响应示例（失败 - 报告编号重复）：**

```json
{
  "error": "DUPLICATE_ENTRY",
  "message": "报告编号已存在",
  "timestamp": "2023-10-13T10:30:00.000Z",
  "requestId": "uuid-here"
}
```

**状态码：**
- 201: 创建成功
- 400: 参数验证失败
- 401: 未授权
- 409: 报告编号已存在
- 500: 服务器错误

**验证规则：**
- reportNumber: 必填，长度 1-50 字符，唯一
- reportType: 必填，枚举值之一
- inspectionDate: 必填，日期格式 YYYY-MM-DD
- equipmentName: 必填，长度 1-200 字符
- clientCompany: 必填，长度 1-200 字符
- userCompany: 必填，长度 1-200 字符
- fileUrl: 必填，长度 1-500 字符
- fileType: 必填，枚举值之一

---

### 5. 更新报告信息

**接口说明：** 更新已存在的报告元数据（不包括文件）

```http
PUT /admin/reports/:id
```

**请求头：**

```http
Content-Type: application/json
Authorization: Bearer {token}
```

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 报告ID |

**请求体（可选字段）：**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| reportType | string | 否 | 报告类型 |
| inspectionDate | string | 否 | 检测日期 |
| equipmentName | string | 否 | 设备名称 |
| clientCompany | string | 否 | 委托单位 |
| userCompany | string | 否 | 使用单位 |

**注意：** `reportNumber` 和 `fileUrl` 不允许修改

**请求示例：**

```json
{
  "equipmentName": "挖掘机 XE60DA（已维修）",
  "inspectionDate": "2023-04-15"
}
```

**响应示例（成功）：**

```json
{
  "id": 1,
  "reportNumber": "ZJW20230145",
  "reportType": "INSPECTION_CERT",
  "inspectionDate": "2023-04-15",
  "equipmentName": "挖掘机 XE60DA（已维修）",
  "clientCompany": "杭州建设工程有限公司",
  "userCompany": "浙江建工集团",
  "fileUrl": "/uploads/reports/2023/10/uuid-filename.pdf",
  "fileType": "PDF",
  "createdAt": "2023-10-13T10:30:00.000Z",
  "updatedAt": "2023-10-13T11:00:00.000Z"
}
```

**状态码：**
- 200: 更新成功
- 400: 参数验证失败
- 401: 未授权
- 404: 报告不存在
- 500: 服务器错误

---

### 6. 删除报告

**接口说明：** 删除报告记录和文件

```http
DELETE /admin/reports/:id
```

**请求头：**

```http
Authorization: Bearer {token}
```

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 报告ID |

**请求示例：**

```http
DELETE /api/admin/reports/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例（成功）：**

```json
{
  "message": "报告删除成功",
  "id": 1
}
```

**状态码：**
- 200: 删除成功
- 401: 未授权
- 404: 报告不存在
- 500: 服务器错误

**删除逻辑：**
1. 从数据库删除报告记录
2. 从文件系统删除对应文件
3. 如果文件删除失败，记录日志但不回滚数据库操作

---

### 7. 获取统计数据

**接口说明：** 获取报告统计信息（用于后台首页）

```http
GET /admin/stats
```

**请求头：**

```http
Authorization: Bearer {token}
```

**响应示例：**

```json
{
  "totalReports": 156,
  "todayUploads": 3,
  "reportsByType": {
    "INSPECTION_CERT": 89,
    "INSTALLATION_INSPECTION": 67
  }
}
```

**状态码：**
- 200: 查询成功
- 401: 未授权
- 500: 服务器错误

---

## 错误码定义

### 错误码列表

| 错误码 | HTTP状态码 | 说明 | 示例消息 |
|--------|-----------|------|----------|
| VALIDATION_ERROR | 400 | 请求参数验证失败 | 参数 xxx 不能为空 |
| UNAUTHORIZED | 401 | 未授权访问 | Token 无效或已过期 |
| FORBIDDEN | 403 | 无权限访问 | 无权限执行此操作 |
| NOT_FOUND | 404 | 资源不存在 | 未找到该报告 |
| DUPLICATE_ENTRY | 409 | 资源重复 | 报告编号已存在 |
| FILE_TOO_LARGE | 400 | 文件过大 | 文件大小不能超过 10MB |
| INVALID_FILE_TYPE | 400 | 文件类型错误 | 仅支持 PDF、JPG、PNG 格式 |
| INTERNAL_SERVER_ERROR | 500 | 服务器内部错误 | 服务器错误，请稍后重试 |

### 错误响应示例

```json
{
  "error": "VALIDATION_ERROR",
  "message": "reportNumber 不能为空",
  "timestamp": "2023-10-13T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "details": {
    "field": "reportNumber",
    "constraint": "required"
  }
}
```

---

## 接口测试

### Postman Collection

创建 Postman Collection 进行接口测试：

#### 环境变量

```json
{
  "baseUrl": "http://localhost:3000/api",
  "token": ""
}
```

#### 测试用例

**1. 登录获取 Token**

```http
POST {{baseUrl}}/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123"
}

// 将返回的 token 保存到环境变量
```

**2. 查询报告（公开接口）**

```http
GET {{baseUrl}}/reports/ZJW20230145
```

**3. 获取报告列表**

```http
GET {{baseUrl}}/admin/reports?page=1&limit=20
Authorization: Bearer {{token}}
```

**4. 上传文件**

```http
POST {{baseUrl}}/admin/upload
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

file: [选择文件]
```

**5. 创建报告**

```http
POST {{baseUrl}}/admin/reports
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "reportNumber": "TEST001",
  "reportType": "INSPECTION_CERT",
  "inspectionDate": "2023-10-13",
  "equipmentName": "测试设备",
  "clientCompany": "测试公司A",
  "userCompany": "测试公司B",
  "fileUrl": "/uploads/test.pdf",
  "fileType": "PDF"
}
```

### cURL 测试命令

**登录：**

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

**查询报告：**

```bash
curl -X GET http://localhost:3000/api/reports/ZJW20230145
```

**获取报告列表：**

```bash
curl -X GET "http://localhost:3000/api/admin/reports?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 接口性能要求

### 响应时间

| 接口类型 | P50 | P95 | P99 |
|----------|-----|-----|-----|
| 公开查询 | < 50ms | < 100ms | < 200ms |
| 列表查询 | < 100ms | < 200ms | < 500ms |
| 创建/更新 | < 200ms | < 500ms | < 1s |
| 文件上传 | < 1s | < 3s | < 5s |

### 并发要求

- 公开查询：支持 100 QPS
- 管理员操作：支持 20 QPS
- 文件上传：支持 5 并发

---

## 接口版本管理

### 版本策略

- **当前版本：** v1（无版本号，默认路径）
- **未来版本：** 通过路径区分（如 `/api/v2/reports`）
- **废弃策略：** 至少保留 6 个月兼容期

### 版本变更记录

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0 | 2023-10-13 | 初始版本 |

---

## 安全建议

### API 安全最佳实践

1. **使用 HTTPS：** 生产环境必须使用 HTTPS
2. **Token 过期：** JWT Token 有效期 7 天
3. **Rate Limiting：**
   - 登录接口：5 次/分钟/IP
   - 其他接口：100 次/分钟/IP
4. **输入验证：** 所有输入必须验证和清理
5. **SQL 注入防护：** 使用 Prisma ORM 参数化查询
6. **XSS 防护：** 前端输出转义
7. **CORS 配置：** 仅允许特定域名访问

---

**文档状态：** 完成
**最后更新：** 2025-10-13

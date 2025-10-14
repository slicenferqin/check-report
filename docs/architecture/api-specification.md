# API Specification

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: 检测报告查询系统 API
  version: 1.0.0
  description: 提供报告查询和管理功能的 RESTful API

servers:
  - url: http://localhost:3000/api
    description: 本地开发环境
  - url: https://api.example.com/api
    description: 生产环境

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Report:
      type: object
      properties:
        id:
          type: integer
        reportNumber:
          type: string
        reportType:
          type: string
          enum: [INSPECTION_CERT, INSTALLATION_INSPECTION]
        inspectionDate:
          type: string
          format: date
        equipmentName:
          type: string
        clientCompany:
          type: string
        userCompany:
          type: string
        fileUrl:
          type: string
        fileType:
          type: string
          enum: [PDF, JPG, PNG]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        details:
          type: object

paths:
  /health:
    get:
      summary: 健康检查
      tags: [System]
      responses:
        '200':
          description: 系统正常
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok

  /reports/{reportNumber}:
    get:
      summary: 查询报告（公开接口）
      tags: [Public]
      parameters:
        - name: reportNumber
          in: path
          required: true
          schema:
            type: string
          description: 报告编号
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Report'
        '404':
          description: 报告不存在
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /admin/login:
    post:
      summary: 管理员登录
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: 登录成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  username:
                    type: string
                  expiresIn:
                    type: integer
        '401':
          description: 用户名或密码错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /admin/upload:
    post:
      summary: 上传报告文件
      tags: [Admin]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '200':
          description: 上传成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  fileUrl:
                    type: string
                  fileType:
                    type: string
        '400':
          description: 文件验证失败
        '401':
          description: 未授权

  /admin/reports:
    get:
      summary: 获取报告列表
      tags: [Admin]
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Report'
                  total:
                    type: integer
                  page:
                    type: integer
                  limit:
                    type: integer

    post:
      summary: 创建报告记录
      tags: [Admin]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reportNumber, reportType, inspectionDate, equipmentName, clientCompany, userCompany, fileUrl, fileType]
              properties:
                reportNumber:
                  type: string
                reportType:
                  type: string
                  enum: [INSPECTION_CERT, INSTALLATION_INSPECTION]
                inspectionDate:
                  type: string
                  format: date
                equipmentName:
                  type: string
                clientCompany:
                  type: string
                userCompany:
                  type: string
                fileUrl:
                  type: string
                fileType:
                  type: string
                  enum: [PDF, JPG, PNG]
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Report'
        '409':
          description: 报告编号已存在

  /admin/reports/{id}:
    put:
      summary: 更新报告元数据
      tags: [Admin]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                reportType:
                  type: string
                inspectionDate:
                  type: string
                equipmentName:
                  type: string
                clientCompany:
                  type: string
                userCompany:
                  type: string
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Report'
        '404':
          description: 报告不存在

    delete:
      summary: 删除报告
      tags: [Admin]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: 删除成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
        '404':
          description: 报告不存在

  /admin/stats:
    get:
      summary: 获取统计数据
      tags: [Admin]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalReports:
                    type: integer
```

---

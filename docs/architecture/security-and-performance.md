# Security and Performance

## Security Requirements

**前端安全：**
- **CSP Headers:** `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.example.com;`
- **XSS Prevention:** React 默认转义输出，避免使用 `dangerouslySetInnerHTML`
- **Secure Storage:** Token 存储在 localStorage（MVP 阶段），生产环境可升级为 HttpOnly Cookie

**后端安全：**
- **Input Validation:** 使用 `express-validator` 验证所有输入，防止注入攻击
- **Rate Limiting:** 使用 `express-rate-limit` 限制 API 请求频率（登录接口 5 次/分钟，其他接口 100 次/分钟）
- **CORS Policy:** `cors({ origin: ['https://www.example.com', 'https://staging.example.com'], credentials: true })`

**认证安全：**
- **Token Storage:** JWT Token，有效期 7 天，客户端存储在 localStorage
- **Session Management:** 无状态认证，Token 过期后需重新登录
- **Password Policy:** 最少 8 位，包含大小写字母和数字，使用 bcrypt 加密（salt rounds: 10）
- **File Access Control:** 文件访问需要经过后端验证，防止直接访问上传目录

---

## Performance Optimization

**前端性能：**
- **Bundle Size Target:** 初始加载 < 200KB（gzip 压缩后）
- **Loading Strategy:** 代码分割（React.lazy），路由级别懒加载
- **Caching Strategy:** Nginx 配置静态资源缓存，浏览器缓存策略
- **图片优化：** 使用合适的图片格式和压缩，懒加载非首屏图片

**后端性能：**
- **Response Time Target:** P95 < 200ms（数据库查询优化）
- **Database Optimization:**
  - 报告编号添加唯一索引
  - 创建时间添加普通索引（用于排序和分页）
  - 定期清理过期数据
- **Caching Strategy:** 使用内存缓存报告查询结果（TTL 5 分钟），减少数据库压力
- **File Serving:**
  - 使用 Nginx 直接提供文件服务，避免 Node.js 处理静态文件
  - 配置 sendfile 和 gzip 压缩
  - 设置合理的缓存头

---

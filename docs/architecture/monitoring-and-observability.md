# Monitoring and Observability

## Monitoring Stack

- **Frontend Monitoring:** 浏览器开发者工具 + 自定义性能监控（可选）
- **Backend Monitoring:** PM2 进程监控 + 系统资源监控（CPU、内存、磁盘）
- **Error Tracking:** Winston 日志文件 + PM2 日志管理
- **Performance Monitoring:** 自定义性能指标，记录 API 响应时间
- **Database Monitoring:** MySQL 慢查询日志分析

## Key Metrics

**Frontend Metrics:**
- Core Web Vitals（LCP、FID、CLS）
- JavaScript 错误率和错误类型
- API 请求成功率和响应时间
- 用户操作流程（查询、上传等）

**Backend Metrics:**
- 请求速率（RPM）
- 错误率（5xx/4xx 占比）
- P50/P95/P99 响应时间
- 数据库查询性能（慢查询日志）

---

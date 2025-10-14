# Deployment Architecture

## Deployment Strategy

**前端部署：**
- **平台：** Nginx 静态文件服务器
- **构建命令：** `pnpm --filter web build`
- **输出目录：** `apps/web/dist`
- **部署路径：** `/var/www/checkReport/dist`
- **HTTPS：** 使用 Let's Encrypt 免费证书或自签名证书

**后端部署：**
- **平台：** Linux 服务器（推荐 Ubuntu 20.04+）
- **构建命令：** `pnpm --filter api build`
- **部署方式：** PM2 进程管理，Nginx 反向代理
- **数据库：** 本地 MySQL 8.0+ 或远程 MySQL 实例
- **文件存储：** `/var/www/checkReport/uploads` 目录

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: checkReport_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Test Frontend
        run: pnpm --filter web test

      - name: Test Backend
        run: |
          cd apps/api
          pnpm prisma migrate deploy
          pnpm test
        env:
          DATABASE_URL: mysql://root:test@localhost:3306/checkReport_test

      - name: Build
        run: pnpm build
```

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install and Build
        run: |
          pnpm install
          pnpm build

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/checkReport
            git pull origin main
            pnpm install
            pnpm build

            # 部署前端
            rm -rf /var/www/checkReport/dist
            cp -r apps/web/dist /var/www/checkReport/

            # 部署后端
            cd apps/api
            pnpm prisma migrate deploy
            pm2 restart checkReport-api

            # 重启 Nginx
            sudo nginx -t && sudo systemctl reload nginx
```

---

## Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:5173 | http://localhost:3000 | 本地开发环境 |
| Production | https://www.your-domain.com | https://www.your-domain.com/api | 生产环境（Nginx 统一入口） |

**说明：** 生产环境使用 Nginx 统一处理前后端请求，前端静态文件和后端 API 共享同一域名，简化 CORS 配置。

---

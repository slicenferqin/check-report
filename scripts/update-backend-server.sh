#!/bin/bash
set -e

cd /var/www/check-report

echo "==> 拉取最新代码..."
git pull origin main

echo ""
echo "==> 更新 Prisma Client..."
cd apps/api
npx prisma generate  # 只生成客户端，不修改数据库（数据库已手动更新）

echo ""
echo "==> 构建前端应用..."
cd ../web  # 从 apps/api 到 apps/web
pnpm run build

echo ""
echo "==> 重启PM2服务..."
cd /var/www/check-report
pm2 restart check-report-api

echo ""
echo "==> 重载 Nginx..."
sudo nginx -t && sudo nginx -s reload

echo ""
echo "=========================================="
echo "✅ 更新完成！"
echo "=========================================="
echo ""
echo "服务状态:"
pm2 status

echo ""
echo "访问地址: http://iaddu.cn"
echo ""
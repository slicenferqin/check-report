import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('测试数据库连接...\n')
  
  // 测试查询 reports 表
  const reportsCount = await prisma.report.count()
  console.log(`✅ reports 表连接成功，当前记录数: ${reportsCount}`)
  
  // 测试查询 admins 表
  const adminsCount = await prisma.admin.count()
  console.log(`✅ admins 表连接成功，当前记录数: ${adminsCount}`)
  
  // 查询管理员账号
  const admin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  })
  
  if (admin) {
    console.log(`✅ 默认管理员账号存在: ${admin.username}`)
  } else {
    console.log('⚠️  未找到默认管理员账号')
  }
  
  console.log('\n🎉 数据库连接测试成功！')
}

main()
  .catch((e) => {
    console.error('❌ 数据库连接失败:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

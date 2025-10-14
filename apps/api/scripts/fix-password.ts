import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('更新管理员密码...\n')
  
  const password = 'Admin@123'
  const passwordHash = await bcrypt.hash(password, 10)
  
  await prisma.admin.update({
    where: { username: 'admin' },
    data: { passwordHash }
  })
  
  console.log('✅ 密码更新成功!')
  console.log('用户名: admin')
  console.log('密码: Admin@123')
  
  // 验证
  const admin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  })
  
  if (admin) {
    const isValid = await bcrypt.compare(password, admin.passwordHash)
    console.log('\n验证结果:', isValid ? '✅ 成功' : '❌ 失败')
  }
}

main()
  .catch((e) => {
    console.error('错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

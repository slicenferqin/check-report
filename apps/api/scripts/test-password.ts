import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('测试管理员密码...\n')
  
  const admin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  })
  
  if (!admin) {
    console.log('❌ 管理员账号不存在')
    return
  }
  
  console.log('✅ 管理员账号存在:', admin.username)
  console.log('密码Hash:', admin.passwordHash)
  
  // 测试密码
  const testPassword = 'Admin@123'
  const isValid = await bcrypt.compare(testPassword, admin.passwordHash)
  
  if (isValid) {
    console.log('✅ 密码验证成功! 密码是:', testPassword)
  } else {
    console.log('❌ 密码验证失败!')
    console.log('\n正在生成正确的密码hash...')
    const correctHash = await bcrypt.hash(testPassword, 10)
    console.log('正确的Hash应该是:', correctHash)
    console.log('\n执行以下SQL更新密码:')
    console.log(`UPDATE admins SET password_hash = '${correctHash}' WHERE username = 'admin';`)
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

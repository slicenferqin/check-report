import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 读取 SQL 文件
  const sqlPath = path.join(__dirname, '../prisma/create-tables.sql')
  const sql = fs.readFileSync(sqlPath, 'utf-8')

  // 分割 SQL 语句
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  // 执行每条 SQL
  for (const statement of statements) {
    console.log('执行SQL:', statement.substring(0, 50) + '...')
    await prisma.$executeRawUnsafe(statement)
  }

  console.log('✅ 数据表创建成功！')

  // 创建默认管理员账号
  console.log('\n创建默认管理员账号...')
  const hashedPassword = await bcrypt.hash('Admin@123', 10)
  
  await prisma.$executeRaw`
    INSERT IGNORE INTO admins (username, password_hash) 
    VALUES ('admin', ${hashedPassword})
  `

  console.log('✅ 默认管理员账号创建成功！')
  console.log('   用户名: admin')
  console.log('   密码: Admin@123')
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

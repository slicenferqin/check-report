import bcrypt from 'bcrypt'

// 生成密码hash的工具脚本
async function hashPassword(password: string) {
  const hash = await bcrypt.hash(password, 10)
  console.log(`Password: ${password}`)
  console.log(`Hash: ${hash}`)
  return hash
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const password = process.argv[2] || 'Admin@123'
  hashPassword(password).then(() => {
    console.log('\n✅ Password hash generated successfully')
  }).catch(err => {
    console.error('❌ Error:', err)
    process.exit(1)
  })
}

export { hashPassword }

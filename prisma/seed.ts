import pkg from 'bcryptjs'
const { hash } = pkg
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 刪除現有用戶
  await prisma.user.deleteMany()

  // 創建管理員用戶
  const hashedPassword = await hash('AdminPassword123!', 10)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '系統管理員',
      status: 'active',
      role: 'admin',
      emailVerified: new Date(),
      phone: '0987654321',
      nickname: '系統管理員',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  console.log('管理員用戶創建成功:', adminUser)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
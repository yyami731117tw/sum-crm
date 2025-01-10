import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const hashedPassword = await hash('admin123', 12)
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@mbc.com' },
      update: {
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        emailVerified: new Date(),
        name: 'Admin'
      },
      create: {
        email: 'admin@mbc.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        emailVerified: new Date()
      }
    })

    console.log('管理員帳號已創建/更新:', admin)
  } catch (error) {
    console.error('創建管理員帳號時發生錯誤:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
}) 
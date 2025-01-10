import pkg from 'bcryptjs'
const { hash } = pkg
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    const hashedPassword = await hash('testpassword123', 10)
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: '測試用戶',
        status: 'active',
        role: 'user',
        emailVerified: new Date(),
        phone: '0912345678',
        nickname: '測試小幫手'
      }
    })

    console.log('測試用戶創建成功:', testUser)
  } catch (error) {
    console.error('創建測試用戶失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser() 
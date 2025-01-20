import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
})

async function main() {
  try {
    console.log('檢查管理員用戶信息...')
    
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        emailVerified: true
      }
    })

    console.log('找到管理員用戶數量:', adminUsers.length)
    adminUsers.forEach((admin, index) => {
      console.log(`\n管理員 ${index + 1}:`)
      console.log('ID:', admin.id)
      console.log('Email:', admin.email)
      console.log('名稱:', admin.name)
      console.log('狀態:', admin.status)
      console.log('創建時間:', admin.createdAt)
      console.log('最後登入:', admin.lastLoginAt)
      console.log('郵箱驗證:', admin.emailVerified)
    })

  } catch (error) {
    console.error('檢查失敗:', error)
    if (error instanceof Error) {
      console.error('錯誤訊息:', error.message)
      console.error('錯誤堆棧:', error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 
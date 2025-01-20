import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

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
    console.log('開始測試資料庫連接...')
    
    // 測試連接
    await prisma.$connect()
    console.log('資料庫連接成功')

    // 檢查用戶表
    const userCount = await prisma.user.count()
    console.log('用戶表存在，當前用戶數量:', userCount)

    // 檢查管理員用戶
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'admin'
      }
    })
    console.log('管理員用戶:', adminUser ? '存在' : '不存在')

    // 如果沒有管理員用戶，創建一個
    if (!adminUser) {
      console.log('創建管理員用戶...')
      const hashedPassword = await hash('admin123', 12)
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@mbc.com',
          name: '系統管理員',
          password: hashedPassword,
          role: 'admin',
          status: 'active',
          emailVerified: new Date()
        }
      })
      console.log('管理員用戶創建成功:', newAdmin.email)
    }

    // 檢查其他必要的表
    const sessionCount = await prisma.session.count()
    console.log('Session表存在，當前數量:', sessionCount)

    const accountCount = await prisma.account.count()
    console.log('Account表存在，當前數量:', accountCount)

    console.log('資料庫測試完成')
  } catch (error) {
    console.error('資料庫測試失敗:', error)
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
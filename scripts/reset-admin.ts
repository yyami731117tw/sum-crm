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
    console.log('開始重置管理員密碼...')
    
    // 生成新密碼的雜湊值
    const newPassword = 'admin123'
    const hashedPassword = await hash(newPassword, 12)
    
    // 更新或創建管理員用戶
    const admin = await prisma.user.upsert({
      where: {
        email: 'admin@mbc.com'
      },
      update: {
        password: hashedPassword,
        status: 'active',
        role: 'admin',
        emailVerified: new Date(),
        name: '系統管理員',
        updatedAt: new Date()
      },
      create: {
        email: 'admin@mbc.com',
        password: hashedPassword,
        name: '系統管理員',
        role: 'admin',
        status: 'active',
        emailVerified: new Date()
      }
    })

    console.log('管理員用戶更新成功:')
    console.log('Email:', admin.email)
    console.log('Name:', admin.name)
    console.log('Role:', admin.role)
    console.log('Status:', admin.status)
    console.log('Password:', newPassword)

  } catch (error) {
    console.error('重置失敗:', error)
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
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function testLoginSetup() {
  try {
    // 清理測試用戶
    await prisma.user.deleteMany({
      where: {
        email: 'admin@example.com'
      }
    })

    // 創建測試用戶
    const hashedPassword = await hash('admin123', 10)
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: '管理員',
        role: 'ADMIN',
        status: 'active',
      }
    })

    console.log('測試用戶創建成功')
    return true
  } catch (error) {
    console.error('測試用戶創建失敗:', error)
    return false
  }
}

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    })

    if (response.ok) {
      console.log('登入測試成功')
      return true
    } else {
      console.error('登入測試失敗:', await response.text())
      return false
    }
  } catch (error) {
    console.error('登入測試出錯:', error)
    return false
  }
}

async function runTests() {
  console.log('開始執行登入測試...')
  
  // 設置測試環境
  const setupSuccess = await testLoginSetup()
  if (!setupSuccess) {
    console.error('測試環境設置失敗')
    return
  }

  // 執行登入測試
  let attempts = 0
  const maxAttempts = 5
  let success = false

  while (attempts < maxAttempts && !success) {
    attempts++
    console.log(`\n執行第 ${attempts} 次登入測試...`)
    success = await testLogin()
    
    if (!success && attempts < maxAttempts) {
      console.log('等待 5 秒後重試...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  if (success) {
    console.log(`\n登入測試成功！共嘗試 ${attempts} 次`)
  } else {
    console.error(`\n登入測試失敗！已嘗試 ${maxAttempts} 次`)
  }

  // 清理測試環境
  await prisma.$disconnect()
}

// 執行測試
runTests().catch(console.error) 
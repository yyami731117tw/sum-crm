import { PrismaClient } from '@prisma/client'

const testPrisma = new PrismaClient()

async function main() {
  try {
    // 測試數據庫連接
    await testPrisma.$connect()
    console.log('數據庫連接成功')

    // 執行一個簡單的查詢
    const userCount = await testPrisma.user.count()
    console.log(`當前用戶數量: ${userCount}`)

  } catch (error) {
    console.error('數據庫測試失敗:', error)
    process.exit(1)
  } finally {
    await testPrisma.$disconnect()
  }
}

main() 
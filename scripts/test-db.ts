const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // 測試連接
    console.log('正在測試資料庫連接...')
    await prisma.$connect()
    console.log('✅ 資料庫連接成功！')

    // 檢查資料表
    console.log('\n正在檢查資料表結構...')
    
    // 檢查 User 資料表
    const userTableInfo = await prisma.user.count()
    console.log('✅ User 資料表存在')
    
    // 檢查 Member 資料表
    const memberTableInfo = await prisma.member.count()
    console.log('✅ Member 資料表存在')
    
    // 檢查 RelatedMember 資料表
    const relatedMemberTableInfo = await prisma.relatedMember.count()
    console.log('✅ RelatedMember 資料表存在')
    
    // 檢查 Investment 資料表
    const investmentTableInfo = await prisma.investment.count()
    console.log('✅ Investment 資料表存在')
    
    // 檢查 MemberLog 資料表
    const memberLogTableInfo = await prisma.memberLog.count()
    console.log('✅ MemberLog 資料表存在')

    // 嘗試建立測試資料
    console.log('\n正在建立測試資料...')
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'test123',
        name: '測試用戶',
        role: 'admin'
      }
    })
    console.log('✅ 成功建立測試用戶')

    // 清理測試資料
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ 成功清理測試資料')

  } catch (error) {
    console.error('❌ 錯誤：', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 
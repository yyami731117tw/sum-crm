import { storage } from '.'
import { UserRole, UserStatus } from './schema'
import { AuthService } from '../auth/auth.service'

export async function seedTestData() {
  const auth = AuthService.getInstance()
  const now = new Date()
  
  // 初始化存儲
  await storage.initialize()

  // 創建測試管理員
  const adminPassword = await auth.hashPassword('Admin@123')
  await storage.users.create({
    email: 'admin@test.com',
    password: adminPassword,
    name: '測試管理員',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: now,
    updatedAt: now
  })

  // 創建測試普通用戶
  const userPassword = await auth.hashPassword('User@123')
  await storage.users.create({
    email: 'user@test.com',
    password: userPassword,
    name: '測試用戶',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: now,
    updatedAt: now
  })

  console.log('測試數據已創建')
  console.log('管理員帳號：admin@test.com / Admin@123')
  console.log('用戶帳號：user@test.com / User@123')
} 
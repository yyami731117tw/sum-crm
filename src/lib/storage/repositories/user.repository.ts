import { Repository } from '../repository'
import { DBSchema, UserRole, UserStatus } from '../schema'
import { Database } from '../db'
import bcrypt from 'bcryptjs'

export class UserRepository extends Repository<'users'> {
  constructor(db: Database) {
    super(db, 'users')
  }

  // 根據電子郵件查找用戶
  async findByEmail(email: string) {
    return this.getByIndex('email', email.toLowerCase())
  }

  // 創建用戶（包含密碼加密）
  async createUser(data: {
    email: string
    password: string
    name: string
    role: UserRole
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    return this.create({
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // 驗證用戶密碼
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getById(userId)
    if (!user) return false
    return bcrypt.compare(password, user.password)
  }

  // 更新用戶密碼
  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    return this.update(userId, { password: hashedPassword })
  }

  // 更新用戶狀態
  async updateStatus(userId: string, status: UserStatus) {
    return this.update(userId, { status })
  }

  // 獲取活躍用戶列表
  async getActiveUsers() {
    return this.query('status', UserStatus.ACTIVE)
  }
} 
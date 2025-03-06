import { Database } from './db'
import { MemberRepository } from './repositories/member.repository'
import { ContractRepository } from './repositories/contract.repository'
import { UserRole, UserStatus } from './schema'
import { UsersRepository } from './repositories/users.repository'
import * as bcrypt from 'bcryptjs'

class Storage {
  private static instance: Storage | null = null
  private db: Database
  private _users: UsersRepository
  private _members: MemberRepository
  private _contracts: ContractRepository

  private constructor() {
    this.db = new Database()
    this._users = new UsersRepository()
    this._members = new MemberRepository(this.db)
    this._contracts = new ContractRepository(this.db)
  }

  public static getInstance(): Storage {
    if (!Storage.instance) {
      Storage.instance = new Storage()
    }
    return Storage.instance
  }

  public async initialize(): Promise<void> {
    // 初始化用戶倉儲
    await this._users.initialize()
    
    try {
      // 檢查是否需要創建默認管理員帳號
      const adminUser = await this._users.findByEmail('admin@example.com')
      if (!adminUser) {
        console.log('創建默認管理員帳號...')
        const hashedPassword = await bcrypt.hash('admin123', 10)
        await this._users.create({
          email: 'admin@example.com',
          password: hashedPassword,
          name: '管理員',
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log('默認管理員帳號創建成功')
      } else {
        console.log('管理員帳號已存在:', adminUser)
        // 確保管理員帳號狀態為啟用
        if (adminUser.status !== UserStatus.ACTIVE) {
          console.log('更新管理員帳號狀態為啟用')
          await this._users.updateStatus(adminUser.id, UserStatus.ACTIVE)
        }
      }
    } catch (error) {
      console.error('初始化管理員帳號時出錯:', error)
    }
  }

  public get users(): UsersRepository {
    return this._users
  }

  public get members(): MemberRepository {
    return this._members
  }

  public get contracts(): ContractRepository {
    return this._contracts
  }

  // 重置所有數據（用於測試）
  public async reset(): Promise<void> {
    await this._users.clear()
    await this.initialize()
  }

  // 關閉資料庫連接
  public async close() {
    await this.db.close()
  }

  // 導出所有資料
  public async exportData() {
    return this.db.exportData()
  }

  // 導入資料
  public async importData(data: any) {
    return this.db.importData(data)
  }
}

// 導出單例實例
export const storage = Storage.getInstance()

// 導出類型
export * from './schema' 
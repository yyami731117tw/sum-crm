import { storage } from '../storage'
import { UserRole, UserStatus } from '../storage/schema'
import * as bcrypt from 'bcryptjs'
import { PasswordValidator } from './password-validator'

// 定義用戶會話資訊
interface UserSession {
  id: string
  email: string
  name: string
  role: UserRole
  token: string
  expiresAt?: number
  lastActivityAt: number
}

export class AuthService {
  private static readonly SESSION_KEY = 'user_session'
  private static readonly REMEMBER_ME_KEY = 'remember_me'
  private static instance: AuthService | null = null
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24小時
  private static readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30分鐘無操作自動登出
  private activityCheckInterval: number | null = null

  private constructor() {
    if (typeof window !== 'undefined') {
      this.startActivityCheck()
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // 登入
  public async login(email: string, password: string, rememberMe: boolean = false): Promise<boolean> {
    try {
      // 初始化存儲
      await storage.initialize()

      // 查找用戶
      const user = await storage.users.findByEmail(email)
      if (!user) {
        throw new Error('用戶不存在')
      }

      // 檢查用戶狀態
      if (user.status !== UserStatus.ACTIVE) {
        throw new Error('用戶帳號已停用')
      }

      // 驗證密碼
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        throw new Error('密碼錯誤')
      }

      // 創建會話
      const session: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token: this.generateToken(),
        expiresAt: rememberMe ? undefined : Date.now() + AuthService.SESSION_DURATION,
        lastActivityAt: Date.now()
      }

      // 保存會話
      this.saveSession(session, rememberMe)
      this.startActivityCheck()

      return true
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // 登出
  public logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AuthService.SESSION_KEY)
      localStorage.removeItem(AuthService.REMEMBER_ME_KEY)
      this.stopActivityCheck()
    }
  }

  // 停止活動檢查
  private stopActivityCheck(): void {
    if (this.activityCheckInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(this.activityCheckInterval)
      this.activityCheckInterval = null
    }
  }

  // 獲取當前會話
  public getCurrentSession(): UserSession | null {
    if (typeof window === 'undefined') return null

    const sessionStr = localStorage.getItem(AuthService.SESSION_KEY)
    if (!sessionStr) return null

    try {
      const session = JSON.parse(sessionStr)
      
      // 檢查會話是否過期
      if (this.isSessionExpired(session)) {
        this.logout()
        return null
      }
      
      return session
    } catch {
      return null
    }
  }

  // 更新最後活動時間
  public updateLastActivity(): void {
    if (typeof window === 'undefined') return

    const session = this.getCurrentSession()
    if (session) {
      session.lastActivityAt = Date.now()
      this.saveSession(session, this.isRememberMe())
    }
  }

  // 檢查會話是否過期
  private isSessionExpired(session: UserSession): boolean {
    if (!session.expiresAt) return false // 如果沒有過期時間（記住我），則不過期
    return Date.now() > session.expiresAt
  }

  // 啟動活動檢查
  private startActivityCheck(): void {
    if (typeof window === 'undefined') return

    if (this.activityCheckInterval === null) {
      this.activityCheckInterval = window.setInterval(() => {
        const session = this.getCurrentSession()
        if (session && Date.now() - session.lastActivityAt > AuthService.INACTIVITY_TIMEOUT) {
          this.logout()
        }
      }, 60000) // 每分鐘檢查一次
    }
  }

  // 檢查是否記住我
  private isRememberMe(): boolean {
    if (typeof window === 'undefined') return false

    const rememberMe = localStorage.getItem(AuthService.REMEMBER_ME_KEY)
    return rememberMe ? JSON.parse(rememberMe) : false
  }

  // 重置密碼
  public async resetPassword(email: string): Promise<void> {
    const user = await storage.users.findByEmail(email)
    if (!user) {
      throw new Error('用戶不存在')
    }

    // 生成臨時密碼
    const tempPassword = this.generateTempPassword()
    
    // 驗證密碼強度
    const strength = PasswordValidator.validate(tempPassword)
    if (!strength.isStrong) {
      throw new Error('生成的臨時密碼強度不足')
    }

    // 加密臨時密碼
    const hashedPassword = await this.hashPassword(tempPassword)
    
    // 更新用戶密碼
    await storage.users.updatePassword(user.id, hashedPassword)
    
    // TODO: 發送臨時密碼到用戶郵箱
    console.log('臨時密碼:', tempPassword)
  }

  // 生成臨時密碼
  private generateTempPassword(): string {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    return password
  }

  // 檢查是否已登入
  public isAuthenticated(): boolean {
    return this.getCurrentSession() !== null
  }

  // 檢查是否具有特定角色
  public hasRole(role: UserRole): boolean {
    const session = this.getCurrentSession()
    return session !== null && session.role === role
  }

  // 檢查是否為管理員
  public isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN)
  }

  // 生成臨時 token
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // 保存會話
  private saveSession(session: UserSession, rememberMe: boolean): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(session))
    localStorage.setItem(AuthService.REMEMBER_ME_KEY, JSON.stringify(rememberMe))
  }

  // 加密密碼
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  }

  // 驗證密碼
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
} 
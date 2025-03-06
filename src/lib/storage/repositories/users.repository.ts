import { UserRole, UserStatus } from '../schema'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export class UsersRepository {
  private users: User[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('users')
      if (data) {
        try {
          const parsedData = JSON.parse(data)
          this.users = Array.isArray(parsedData) ? parsedData.map(user => ({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          })) : []
        } catch (error) {
          console.error('Error parsing users data:', error)
          this.users = []
        }
      }
    }
  }

  public async initialize(): Promise<void> {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('users')
      if (data) {
        try {
          const parsedData = JSON.parse(data)
          this.users = Array.isArray(parsedData) ? parsedData.map(user => ({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          })) : []
        } catch (error) {
          console.error('Error parsing users data:', error)
          this.users = []
        }
      }
    }
  }

  private save(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('users', JSON.stringify(this.users))
      } catch (error) {
        console.error('Error saving users data:', error)
      }
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null
  }

  public async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser = {
      ...user,
      id: Math.random().toString(36).substring(2),
      status: user.status || UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.users.push(newUser)
    this.save()
    return newUser
  }

  public async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const user = this.users.find(u => u.id === userId)
    if (user) {
      user.password = hashedPassword
      user.updatedAt = new Date()
      this.save()
    }
  }

  public async updateStatus(userId: string, status: UserStatus): Promise<void> {
    const user = this.users.find(u => u.id === userId)
    if (user) {
      user.status = status
      user.updatedAt = new Date()
      this.save()
    }
  }

  public async clear(): Promise<void> {
    this.users = []
    this.save()
  }

  public async getAll(): Promise<User[]> {
    return this.users
  }
} 
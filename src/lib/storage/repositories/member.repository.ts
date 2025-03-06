import { Repository } from '../repository'
import { DBSchema, MemberType, UserStatus } from '../schema'
import { Database } from '../db'

interface Member {
  id: string
  name: string
  phone: string
  idNumber: string
  type: MemberType
  status: UserStatus
  expiryDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

export class MemberRepository {
  constructor(private db: Database) {}

  // 根據身分證字號查找會員
  async findByIdNumber(idNumber: string) {
    return this.getByIndex('idNumber', idNumber.toUpperCase())
  }

  // 根據會員類型查找會員
  async findByType(type: MemberType) {
    return this.query('type', type)
  }

  // 根據狀態查找會員
  async findByStatus(status: UserStatus) {
    return this.query('status', status)
  }

  // 創建會員
  async createMember(data: {
    name: string
    phone: string
    idNumber: string
    type: MemberType
    expiryDate?: Date
    notes?: string
    createdBy: string
  }) {
    return this.create({
      ...data,
      idNumber: data.idNumber.toUpperCase(),
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: data.createdBy
    })
  }

  // 更新會員狀態
  async updateStatus(memberId: string, status: UserStatus, updatedBy: string) {
    return this.update(memberId, { 
      status,
      updatedAt: new Date()
    }, updatedBy)
  }

  // 更新會員類型
  async updateType(memberId: string, type: MemberType, updatedBy: string) {
    return this.update(memberId, {
      type,
      updatedAt: new Date()
    }, updatedBy)
  }

  // 更新會員到期日
  async updateExpiryDate(memberId: string, expiryDate: Date | null, updatedBy: string) {
    return this.update(memberId, {
      expiryDate: expiryDate || undefined,
      updatedAt: new Date()
    }, updatedBy)
  }

  // 獲取即將到期的會員
  async getExpiringMembers(daysThreshold: number) {
    const now = new Date()
    const threshold = new Date()
    threshold.setDate(now.getDate() + daysThreshold)

    const allMembers = await this.getAll()
    return allMembers.filter(member => 
      member.expiryDate && 
      member.expiryDate > now && 
      member.expiryDate <= threshold
    )
  }

  // 獲取已到期的會員
  async getExpiredMembers() {
    const now = new Date()
    const allMembers = await this.getAll()
    return allMembers.filter(member => 
      member.expiryDate && 
      member.expiryDate <= now
    )
  }

  // 搜尋會員
  async searchMembers(query: string) {
    const allMembers = await this.getAll()
    const searchText = query.toLowerCase()
    
    return allMembers.filter(member =>
      member.name.toLowerCase().includes(searchText) ||
      member.idNumber.toLowerCase().includes(searchText) ||
      member.phone.includes(searchText)
    )
  }

  // 更新會員資料
  public async update(id: string, data: Partial<Omit<Member, 'id'>>, updatedBy: string): Promise<void> {
    const store = await this.getStore()
    const member = await this.findById(id)
    
    if (!member) {
      throw new Error('會員不存在')
    }

    const { expiryDate, ...rest } = data
    await store.put({
      ...member,
      ...rest,
      expiryDate: expiryDate || undefined,
      updatedAt: new Date(),
      updatedBy
    })
  }
} 
import { Repository } from '../repository'
import { DBSchema, ContractStatus } from '../schema'
import { Database } from '../db'

export class ContractRepository {
  constructor(private db: Database) {}

  // 根據會員 ID 查找合約
  async findByMemberId(memberId: string) {
    return this.query('memberId', memberId)
  }

  // 根據狀態查找合約
  async findByStatus(status: ContractStatus) {
    return this.query('status', status)
  }

  // 創建合約
  async createContract(data: {
    memberId: string
    title: string
    content: string
    startDate: Date
    endDate?: Date
    amount: number
    paymentMethod?: string
    bankAccount?: string
    attachments?: Array<{
      name: string
      data: string
    }>
    createdBy: string
  }) {
    return this.create({
      ...data,
      status: ContractStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: data.createdBy
    })
  }

  // 更新合約狀態
  async updateStatus(contractId: string, status: ContractStatus, updatedBy: string) {
    return this.update(contractId, {
      status,
      updatedBy,
      updatedAt: new Date()
    })
  }

  // 更新合約內容
  async updateContent(
    contractId: string,
    data: {
      title?: string
      content?: string
      startDate?: Date
      endDate?: Date
      amount?: number
      paymentMethod?: string
      bankAccount?: string
    },
    updatedBy: string
  ) {
    return this.update(contractId, {
      ...data,
      updatedBy,
      updatedAt: new Date()
    })
  }

  // 添加附件
  async addAttachment(
    contractId: string,
    attachment: {
      name: string
      data: string
    },
    updatedBy: string
  ) {
    const contract = await this.getById(contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const attachments = [...(contract.attachments || []), attachment]
    return this.update(contractId, {
      attachments,
      updatedBy,
      updatedAt: new Date()
    })
  }

  // 移除附件
  async removeAttachment(contractId: string, attachmentName: string, updatedBy: string) {
    const contract = await this.getById(contractId)
    if (!contract) {
      throw new Error('Contract not found')
    }

    const attachments = (contract.attachments || [])
      .filter(a => a.name !== attachmentName)

    return this.update(contractId, {
      attachments,
      updatedBy,
      updatedAt: new Date()
    })
  }

  // 獲取即將到期的合約
  async getExpiringContracts(daysThreshold: number) {
    const now = new Date()
    const threshold = new Date()
    threshold.setDate(now.getDate() + daysThreshold)

    const allContracts = await this.getAll()
    return allContracts.filter(contract => 
      contract.status === ContractStatus.ACTIVE &&
      contract.endDate &&
      contract.endDate > now &&
      contract.endDate <= threshold
    )
  }

  // 獲取已到期的合約
  async getExpiredContracts() {
    const now = new Date()
    const allContracts = await this.getAll()
    return allContracts.filter(contract =>
      contract.status === ContractStatus.ACTIVE &&
      contract.endDate &&
      contract.endDate <= now
    )
  }

  // 搜尋合約
  async searchContracts(query: string) {
    const allContracts = await this.getAll()
    const searchText = query.toLowerCase()

    return allContracts.filter(contract =>
      contract.title.toLowerCase().includes(searchText) ||
      contract.content.toLowerCase().includes(searchText)
    )
  }
} 
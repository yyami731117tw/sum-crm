import { Database } from './db'
import { DBSchema } from './schema'
import { v4 as uuidv4 } from 'uuid'

export class Repository<T extends keyof DBSchema> {
  constructor(
    private db: Database,
    private storeName: T
  ) {}

  // 創建記錄
  async create(data: Omit<DBSchema[T]['value'], 'id'>): Promise<DBSchema[T]['value']> {
    const connection = await this.db.connect()
    const id = uuidv4()
    const record = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as DBSchema[T]['value']

    await connection.add(this.storeName, record)
    return record
  }

  // 根據 ID 獲取記錄
  async getById(id: string): Promise<DBSchema[T]['value'] | undefined> {
    const connection = await this.db.connect()
    return connection.get(this.storeName, id)
  }

  // 獲取所有記錄
  async getAll(): Promise<DBSchema[T]['value'][]> {
    const connection = await this.db.connect()
    return connection.getAll(this.storeName)
  }

  // 根據條件查詢記錄
  async query(indexName: string, query: IDBValidKey | IDBKeyRange): Promise<DBSchema[T]['value'][]> {
    const connection = await this.db.connect()
    return connection.getAllFromIndex(this.storeName, indexName, query)
  }

  // 更新記錄
  async update(id: string, data: Partial<DBSchema[T]['value']>): Promise<DBSchema[T]['value']> {
    const connection = await this.db.connect()
    const record = await this.getById(id)
    
    if (!record) {
      throw new Error('Record not found')
    }

    const updatedRecord = {
      ...record,
      ...data,
      id,
      updatedAt: new Date()
    } as DBSchema[T]['value']

    await connection.put(this.storeName, updatedRecord)
    return updatedRecord
  }

  // 刪除記錄
  async delete(id: string): Promise<void> {
    const connection = await this.db.connect()
    await connection.delete(this.storeName, id)
  }

  // 根據索引獲取單條記錄
  async getByIndex(indexName: string, key: IDBValidKey): Promise<DBSchema[T]['value'] | undefined> {
    const connection = await this.db.connect()
    return connection.getFromIndex(this.storeName, indexName, key)
  }

  // 批量創建記錄
  async bulkCreate(records: Omit<DBSchema[T]['value'], 'id'>[]): Promise<DBSchema[T]['value'][]> {
    const connection = await this.db.connect()
    const tx = connection.transaction(this.storeName, 'readwrite')
    const store = tx.objectStore(this.storeName)

    const createdRecords = await Promise.all(
      records.map(async (data) => {
        const id = uuidv4()
        const record = {
          ...data,
          id,
          createdAt: new Date(),
          updatedAt: new Date()
        } as DBSchema[T]['value']

        await store.add(record)
        return record
      })
    )

    await tx.done
    return createdRecords
  }

  // 批量更新記錄
  async bulkUpdate(records: Array<{ id: string; data: Partial<DBSchema[T]['value']> }>): Promise<DBSchema[T]['value'][]> {
    const connection = await this.db.connect()
    const tx = connection.transaction(this.storeName, 'readwrite')
    const store = tx.objectStore(this.storeName)

    const updatedRecords = await Promise.all(
      records.map(async ({ id, data }) => {
        const record = await store.get(id)
        if (!record) {
          throw new Error(`Record with id ${id} not found`)
        }

        const updatedRecord = {
          ...record,
          ...data,
          id,
          updatedAt: new Date()
        } as DBSchema[T]['value']

        await store.put(updatedRecord)
        return updatedRecord
      })
    )

    await tx.done
    return updatedRecords
  }

  // 批量刪除記錄
  async bulkDelete(ids: string[]): Promise<void> {
    const connection = await this.db.connect()
    const tx = connection.transaction(this.storeName, 'readwrite')
    const store = tx.objectStore(this.storeName)

    await Promise.all(ids.map(id => store.delete(id)))
    await tx.done
  }
} 
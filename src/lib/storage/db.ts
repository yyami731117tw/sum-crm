import { openDB, DBSchema as IDBSchema, IDBPDatabase } from 'idb'
import { DBSchema } from './schema'

const DB_NAME = 'mbc_crm'
const DB_VERSION = 1

export class Database {
  private db: IDBPDatabase<DBSchema> | null = null

  constructor() {
    // 初始化資料庫
  }

  async connect() {
    if (this.db) return this.db

    this.db = await openDB<DBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 創建用戶表
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' })
          userStore.createIndex('email', 'email', { unique: true })
        }

        // 創建會員表
        if (!db.objectStoreNames.contains('members')) {
          const memberStore = db.createObjectStore('members', { keyPath: 'id' })
          memberStore.createIndex('idNumber', 'idNumber', { unique: true })
          memberStore.createIndex('type', 'type')
          memberStore.createIndex('status', 'status')
        }

        // 創建合約表
        if (!db.objectStoreNames.contains('contracts')) {
          const contractStore = db.createObjectStore('contracts', { keyPath: 'id' })
          contractStore.createIndex('memberId', 'memberId')
          contractStore.createIndex('status', 'status')
        }

        // 創建關係表
        if (!db.objectStoreNames.contains('relations')) {
          const relationStore = db.createObjectStore('relations', { keyPath: 'id' })
          relationStore.createIndex('memberId', 'memberId')
          relationStore.createIndex('relatedMemberId', 'relatedMemberId')
        }

        // 創建變更記錄表
        if (!db.objectStoreNames.contains('changelog')) {
          const changelogStore = db.createObjectStore('changelog', { keyPath: 'id' })
          changelogStore.createIndex('entityType', 'entityType')
          changelogStore.createIndex('entityId', 'entityId')
        }

        // 創建設定表
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { keyPath: 'id' })
          settingsStore.createIndex('key', 'key', { unique: true })
        }
      }
    })

    return this.db
  }

  async close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  // 資料導出功能
  async exportData() {
    const db = await this.connect()
    const data: Partial<{ [K in keyof DBSchema]: any[] }> = {}

    // 導出所有表的資料
    for (const storeName of db.objectStoreNames) {
      data[storeName as keyof DBSchema] = await db.getAll(storeName)
    }

    return data
  }

  // 資料導入功能
  async importData(data: Partial<{ [K in keyof DBSchema]: any[] }>) {
    const db = await this.connect()

    // 清空所有表
    for (const storeName of db.objectStoreNames) {
      const tx = db.transaction(storeName, 'readwrite')
      await tx.objectStore(storeName).clear()
    }

    // 導入資料
    for (const [storeName, items] of Object.entries(data)) {
      const tx = db.transaction(storeName as keyof DBSchema, 'readwrite')
      const store = tx.objectStore(storeName as keyof DBSchema)
      for (const item of items) {
        await store.add(item)
      }
      await tx.done
    }
  }
} 
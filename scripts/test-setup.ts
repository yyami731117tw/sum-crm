import { seedTestData } from '../src/lib/storage/seed'

async function setup() {
  try {
    await seedTestData()
    console.log('測試環境設置完成')
  } catch (error) {
    console.error('測試環境設置失敗:', error)
    process.exit(1)
  }
}

setup() 
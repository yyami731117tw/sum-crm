import { PrismaClient } from '@prisma/client'

class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    })
  }

  // 添加自定義方法或型別擴展
  async safeQuery<T>(model: string, method: string, args: any): Promise<T | null> {
    try {
      return await (this as any)[model][method](args)
    } catch (error) {
      console.error(`Database query error in ${model}.${method}:`, error)
      return null
    }
  }
}

const prismaClientSingleton = () => {
  return new ExtendedPrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  if (!(global as any).prisma) {
    (global as any).prisma = prisma
  }
}

export default prisma 
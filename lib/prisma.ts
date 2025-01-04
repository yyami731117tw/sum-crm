import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient()
}

const prisma = globalForPrisma.prisma as PrismaClient

export default prisma 
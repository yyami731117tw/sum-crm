import { PrismaClient } from '@prisma/client'
import { UserSession } from '@/types/auth'

const prisma = new PrismaClient()

export async function createSession(user: UserSession) {
  return await prisma.session.create({
    data: {
      sessionToken: user.id,
      userId: user.id,
      expires: user.expiresAt
    }
  })
}

export async function getSession(id: string) {
  return await prisma.session.findUnique({
    where: { sessionToken: id },
    include: {
      user: true
    }
  })
}

export async function deleteSession(id: string) {
  return await prisma.session.delete({
    where: { sessionToken: id }
  })
}

export async function deleteExpiredSessions() {
  return await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  })
} 
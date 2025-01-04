import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

interface SessionInput {
  id: string
  userId: string
  expiresAt: Date
}

export async function createSession(input: SessionInput) {
  return await prisma.session.create({
    data: {
      sessionToken: input.id,
      userId: input.userId,
      expires: input.expiresAt
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
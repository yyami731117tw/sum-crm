import { PrismaClient } from '@prisma/client'
import { hash, compare } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

interface CreateSessionParams {
  userId: string
  expiresAt: Date
}

export async function createSession({ userId, expiresAt }: CreateSessionParams) {
  const sessionToken = uuidv4()

  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: expiresAt
    }
  })

  return session
}

export async function validatePassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}

export async function hashPassword(password: string) {
  return hash(password, 10)
}

export async function getSessionAndUser(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  })

  if (!session) return null

  if (session.expires < new Date()) {
    await prisma.session.delete({
      where: { sessionToken }
    })
    return null
  }

  return session
}

export async function deleteSession(sessionToken: string) {
  await prisma.session.delete({
    where: { sessionToken }
  })
} 
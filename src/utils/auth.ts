import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
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

export function withAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      return res.status(401).json({ message: '未授權訪問' })
    }

    return handler(req, res, session)
  }
}

export function withRole(roles: string | string[]) {
  return function(handler: any) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const session = await getServerSession(req, res, authOptions)

      if (!session?.user?.role) {
        return res.status(401).json({ message: '請先登入' })
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles]
      if (!allowedRoles.includes(session.user.role)) {
        return res.status(403).json({ message: '權限不足' })
      }

      return handler(req, res, session)
    }
  }
}

export function withStatus(allowedStatuses: string | string[]) {
  return function(handler: any) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const session = await getServerSession(req, res, authOptions)

      if (!session?.user?.status) {
        return res.status(401).json({ message: '請先登入' })
      }

      const statusArray = Array.isArray(allowedStatuses) ? allowedStatuses : [allowedStatuses]
      if (!statusArray.includes(session.user.status)) {
        return res.status(403).json({ message: '帳號狀態不符合要求' })
      }

      return handler(req, res, session)
    }
  }
} 
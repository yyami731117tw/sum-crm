import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../pages/api/auth/[...nextauth]'

export function withAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      return res.status(401).json({ message: '請先登入' })
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
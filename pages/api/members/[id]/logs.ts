import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: '請先登入' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: '無效的會員 ID' })
  }

  try {
    switch (req.method) {
      case 'GET':
        const logs = await prisma.memberLog.findMany({
          where: { memberId: id },
          orderBy: {
            createdAt: 'desc'
          }
        })
        return res.status(200).json(logs)

      case 'POST':
        const newLog = await prisma.memberLog.create({
          data: {
            ...req.body,
            memberId: id,
            operator: session.user.name || '系統管理員'
          }
        })
        return res.status(201).json(newLog)

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: '內部伺服器錯誤' })
  }
} 
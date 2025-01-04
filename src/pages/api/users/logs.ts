import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: '請先登入' })
  }

  if (session.user.role !== 'admin') {
    return res.status(403).json({ message: '權限不足' })
  }

  if (req.method === 'GET') {
    try {
      const { userId } = req.query

      const logs = await prisma.userLog.findMany({
        where: userId ? { userId: String(userId) } : undefined,
        orderBy: {
          timestamp: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      return res.status(200).json(logs)
    } catch (error) {
      console.error('獲取用戶日誌失敗:', error)
      return res.status(500).json({ message: '獲取用戶日誌失敗' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, action, details, changes } = req.body

      if (!userId || !action || !details) {
        return res.status(400).json({ message: '缺少必要參數' })
      }

      const log = await prisma.userLog.create({
        data: {
          userId,
          action,
          details,
          operator: session.user.name || session.user.email || '未知用戶',
          changes
        }
      })

      return res.status(201).json(log)
    } catch (error) {
      console.error('創建用戶日誌失敗:', error)
      return res.status(500).json({ message: '創建用戶日誌失敗' })
    }
  }

  return res.status(405).json({ message: '不支援的請求方法' })
} 
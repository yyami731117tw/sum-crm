import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '@/lib/prisma'
import { logger } from '../../../utils/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ message: '請先登入' })
  }

  const email = session.user.email

  if (!email) {
    return res.status(400).json({ message: '無效的用戶信息' })
  }

  if (req.method === 'PUT') {
    try {
      const { name, phone, lineId, address, birthday } = req.body

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name: name || null,
          phone: phone || null,
          lineId: lineId || null,
          address: address || null,
          birthday: birthday ? new Date(birthday) : null
        }
      })

      // 移除敏感信息
      const { password, ...userWithoutPassword } = updatedUser

      return res.status(200).json(userWithoutPassword)

    } catch (error) {
      logger.error('更新用戶資料失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
      return res.status(500).json({ message: '更新用戶資料失敗，請稍後再試' })
    }
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return res.status(404).json({ message: '找不到用戶' })
      }

      // 移除敏感信息
      const { password, ...userWithoutPassword } = user

      return res.status(200).json(userWithoutPassword)

    } catch (error) {
      logger.error('獲取用戶資料失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
      return res.status(500).json({ message: '獲取用戶資料失敗，請稍後再試' })
    }
  }

  return res.status(405).json({ message: '方法不允許' })
} 
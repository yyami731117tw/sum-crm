import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '../../../src/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ message: '請先登入' })
  }

  const userId = session.user.id

  if (req.method === 'PUT') {
    try {
      const { name, phone, lineId, address, birthday } = req.body

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          lineId,
          address,
          birthday: birthday ? new Date(birthday) : null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          lineId: true,
          address: true,
          birthday: true,
          role: true,
          status: true,
        },
      })

      return res.json(updatedUser)
    } catch (error) {
      console.error('更新個人資料失敗:', error)
      return res.status(500).json({ message: '更新個人資料失敗' })
    }
  }

  return res.status(405).json({ message: '不支援的請求方法' })
} 
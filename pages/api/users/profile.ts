import { NextApiRequest, NextApiResponse } from 'next'
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

  const userId = session.user.id

  if (req.method === 'PUT') {
    try {
      const { name, nickname, phone, lineId, address, birthday, image } = req.body

      // 先檢查使用者是否存在
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return res.status(404).json({ message: '找不到使用者' })
      }

      // 更新使用者資料
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || null,
          nickname: nickname || null,
          phone: phone || null,
          lineId: lineId || null,
          address: address || null,
          birthday: birthday ? new Date(birthday) : null,
          image: image || null,
        },
      })

      // 轉換日期格式
      const formattedUser = {
        ...updatedUser,
        birthday: updatedUser.birthday ? updatedUser.birthday.toISOString().split('T')[0] : null,
      }

      return res.json(formattedUser)
    } catch (error) {
      console.error('更新個人資料失敗:', error)
      return res.status(500).json({ message: '更新個人資料失敗' })
    }
  }

  return res.status(405).json({ message: '不支援的請求方法' })
} 
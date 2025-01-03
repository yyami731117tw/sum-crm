import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })

  if (!session) {
    return res.status(401).json({ error: '未登入' })
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: '方法不允許' })
  }

  try {
    const userId = session.user.id
    const userData = req.body

    // 更新用戶資料
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.name,
        nickname: userData.nickname,
        phone: userData.phone,
        lineId: userData.lineId,
        address: userData.address,
        birthday: userData.birthday,
        image: userData.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        nickname: true,
        phone: true,
        lineId: true,
        address: true,
        birthday: true,
        role: true,
        status: true,
        image: true,
      },
    })

    return res.status(200).json(updatedUser)
  } catch (error) {
    console.error('更新用戶資料失敗:', error)
    return res.status(500).json({ error: '更新失敗' })
  }
} 
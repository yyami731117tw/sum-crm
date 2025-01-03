import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const members = await prisma.member.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      })
      return res.status(200).json(members)
    } catch (error) {
      console.error('獲取會員列表失敗:', error)
      return res.status(500).json({ error: '獲取會員列表失敗' })
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body

      const newMember = await prisma.member.create({
        data: {
          memberNo: data.memberNo,
          name: data.name,
          nickname: data.nickname,
          phone: data.phone,
          email: data.email,
          status: data.status,
        },
      })

      return res.status(201).json(newMember)
    } catch (error) {
      console.error('新增會員失敗:', error)
      return res.status(500).json({ error: '新增會員失敗' })
    }
  }

  return res.status(405).json({ error: '方法不允許' })
} 
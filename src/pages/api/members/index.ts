import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { logger } from '../../../utils/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const data = req.body

      // 驗證必要欄位
      const requiredFields = ['memberNo', 'name', 'gender', 'idNumber', 'birthday', 'memberType']
      const missingFields = requiredFields.filter(field => !data[field])

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `缺少必要欄位: ${missingFields.join(', ')}`
        })
      }

      // 創建新會員
      const newMember = await prisma.member.create({
        data: {
          memberNo: data.memberNo,
          name: data.name,
          nickname: data.nickname || null,
          gender: data.gender,
          idNumber: data.idNumber,
          birthday: new Date(data.birthday),
          phone: data.phone || null,
          email: data.email || null,
          status: data.status || 'active',
          memberType: data.memberType,
          createdAt: new Date()
        }
      })

      return res.status(201).json(newMember)

    } catch (error) {
      logger.error('創建會員失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
      return res.status(500).json({ message: '創建會員失敗，請稍後再試' })
    }
  }

  if (req.method === 'GET') {
    try {
      const members = await prisma.member.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json(members)

    } catch (error) {
      logger.error('獲取會員列表失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
      return res.status(500).json({ message: '獲取會員列表失敗，請稍後再試' })
    }
  }

  return res.status(405).json({ message: '方法不允許' })
} 
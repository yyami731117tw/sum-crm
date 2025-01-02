import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許 GET 請求' })
  }

  try {
    const { idNumber, excludeId } = req.query

    if (!idNumber) {
      return res.status(400).json({ 
        success: false,
        message: '身分證字號為必填' 
      })
    }

    // 查詢是否有其他會員使用相同身分證字號
    const existingMember = await prisma.member.findFirst({
      where: {
        idNumber: idNumber as string,
        id: {
          not: excludeId as string // 排除當前編輯的會員
        }
      }
    })

    return res.status(200).json({
      success: true,
      isDuplicate: !!existingMember,
      message: existingMember ? '此身分證字號已被使用' : ''
    })
  } catch (error) {
    console.error('檢查身分證字號失敗:', error)
    return res.status(500).json({ 
      success: false,
      message: '檢查失敗，請稍後再試' 
    })
  }
} 
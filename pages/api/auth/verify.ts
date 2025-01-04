import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { logger } from '@/utils/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  const { userId, code } = req.body

  if (!userId || !code) {
    return res.status(400).json({ message: '缺少必要參數' })
  }

  try {
    // 查找未使用且未過期的驗證碼
    const [verificationCode] = await prisma.$queryRaw<{ id: string; code: string; user_id: string; expires_at: Date; created_at: Date; used: boolean }[]>`
      SELECT * FROM verification_codes
      WHERE user_id = ${userId}
      AND code = ${code}
      AND used = false
      AND expires_at > NOW()
      LIMIT 1
    `
    
    if (!verificationCode) {
      return res.status(400).json({ message: '驗證碼無效或已過期' })
    }

    // 標記驗證碼為已使用
    await prisma.$executeRaw`
      UPDATE verification_codes
      SET used = true
      WHERE id = ${verificationCode.id}
    `

    // 更新用戶狀態
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'active' }
    })

    return res.status(200).json({ message: '驗證成功' })

  } catch (error) {
    logger.error('驗證失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
    return res.status(500).json({ message: '驗證失敗，請稍後再試' })
  }
} 
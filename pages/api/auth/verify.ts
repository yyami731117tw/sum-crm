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
    return res.status(400).json({ message: '缺少必要欄位' })
  }

  try {
    // 查找驗證碼
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: userId,
        token: code,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!verificationToken) {
      return res.status(400).json({ message: '驗證碼無效或已過期' })
    }

    // 更新用戶狀態
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
        status: 'active'
      }
    })

    // 刪除已使用的驗證碼
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: userId,
          token: code
        }
      }
    })

    return res.status(200).json({ message: '驗證成功' })

  } catch (error) {
    logger.error('驗證失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
    return res.status(500).json({ message: '驗證失敗，請稍後再試' })
  }
} 
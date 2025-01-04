import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import { sendEmail, generateVerificationEmailContent } from '@/utils/email'
import { logger } from '@/utils/logger'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  const { email, password, name, phone, birthday } = req.body

  if (!email || !password || !name || !phone || !birthday) {
    return res.status(400).json({ message: '缺少必要欄位' })
  }

  // 驗證電話格式
  if (!phone.match(/^09\d{8}$/)) {
    return res.status(400).json({ message: '請輸入有效的手機號碼' })
  }

  // 驗證生日格式和有效性
  const birthDate = new Date(birthday)
  const today = new Date()
  if (isNaN(birthDate.getTime()) || birthDate > today) {
    return res.status(400).json({ message: '請輸入有效的生日' })
  }

  try {
    // 檢查郵箱是否已被使用
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: '此郵箱已被註冊' })
    }

    // 檢查電話是否已被使用
    const existingPhone = await prisma.user.findFirst({
      where: { phone }
    })

    if (existingPhone) {
      return res.status(400).json({ message: '此電話號碼已被註冊' })
    }

    // 生成驗證碼
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // 創建新用戶和驗證碼
    const result = await prisma.$transaction(async (prisma) => {
      // 創建用戶
      const user = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          birthday: birthDate,
          password: await hash(password, 10),
          role: 'guest',      // 預設角色為訪客
          status: 'pending',  // 預設狀態為待審核
          createdAt: new Date()
        }
      })

      // 創建驗證碼
      const verification = await prisma.VerificationCode.create({
        data: {
          code: verificationCode,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分鐘後過期
        }
      })

      return { user, verification }
    })

    // 發送驗證郵件
    const emailContent = generateVerificationEmailContent(name, verificationCode)
    const emailResult = await sendEmail({
      to: email,
      subject: '多元商會員系統 - 電子郵件驗證',
      html: emailContent
    })

    if (!emailResult.success) {
      // 如果郵件發送失敗，刪除已創建的用戶和驗證碼
      await prisma.user.delete({
        where: { id: result.user.id }
      })
      return res.status(500).json({ message: '驗證郵件發送失敗' })
    }

    return res.status(201).json({
      message: '註冊成功，請查收驗證郵件',
      userId: result.user.id
    })

  } catch (error) {
    logger.error('註冊失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
    return res.status(500).json({ message: '註冊失敗，請稍後再試' })
  }
} 
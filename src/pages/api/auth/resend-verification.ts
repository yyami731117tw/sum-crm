import type { NextApiRequest, NextApiResponse } from 'next'
import { sendEmail, generateVerificationEmailContent } from '../../../utils/email'

interface ResendVerificationData {
  verificationToken: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const { verificationToken } = req.body as ResendVerificationData

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: '缺少驗證令牌'
      })
    }

    // TODO: 從資料庫中查找對應的用戶資訊
    const user = {
      email: 'user@example.com',
      name: '測試用戶',
      verificationCode: '123456'
    }

    // 生成新的驗證碼
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // 發送新的驗證郵件
    const emailContent = generateVerificationEmailContent(user.name, newVerificationCode)
    const emailResult = await sendEmail({
      to: user.email,
      subject: '多元商會員系統 - 新的驗證碼',
      html: emailContent
    })

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: '發送驗證郵件失敗'
      })
    }

    // TODO: 更新資料庫中的驗證碼
    console.log('New verification code:', newVerificationCode)

    return res.status(200).json({
      success: true,
      message: '新的驗證碼已發送至您的信箱'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return res.status(500).json({
      success: false,
      message: '重新發送驗證碼時發生錯誤'
    })
  }
} 
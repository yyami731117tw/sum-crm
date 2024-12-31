import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail, generateVerificationEmailContent } from '../../../utils/email'
import { checkPasswordStrength } from '../../../utils/password'

interface SignupData {
  email: string
  password: string
  name: string
  phone: string
  birthday: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const { email, password, name, phone, birthday } = req.body as SignupData

    // 基本資料驗證
    if (!email || !password || !name || !phone || !birthday) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DATA',
        message: '請填寫所有必要資料'
      })
    }

    // 電子郵件格式驗證
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: '無效的電子郵件格式'
      })
    }

    // 密碼強度驗證
    const passwordStrength = checkPasswordStrength(password)
    if (passwordStrength.score < 1) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: '密碼需要至少包含8個字符，並包含字母和數字'
      })
    }

    // 檢查是否已經註冊
    const userExists = false // 這裡應該是實際的資料庫查詢
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'USER_EXISTS',
        message: '此電子郵件已經註冊'
      })
    }

    // 生成驗證碼和令牌
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationToken = uuidv4()

    // 建立新用戶
    const user = {
      id: uuidv4(),
      email,
      name,
      phone,
      birthday,
      status: 'pending',
      role: 'user',
      verificationCode,
      verificationToken,
      createdAt: new Date().toISOString()
    }

    // 發送驗證郵件
    const emailContent = generateVerificationEmailContent(name, verificationCode)
    const emailResult = await sendEmail({
      to: email,
      subject: '多元商會員系統 - 電子郵件驗證',
      html: emailContent
    })

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: '發送驗證郵件失敗'
      })
    }

    // TODO: 將用戶資料儲存到資料庫
    console.log('New user:', user)

    // 返回成功響應
    return res.status(201).json({
      success: true,
      message: '註冊成功，請查收驗證郵件',
      verificationToken
    })

  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({
      success: false,
      message: '註冊時發生錯誤'
    })
  }
} 
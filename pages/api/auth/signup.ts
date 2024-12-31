import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const { email, password, name, phone, birthday } = req.body

    // 檢查是否已經註冊
    const userExists = false // 這裡應該是實際的資料庫查詢
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'USER_EXISTS',
        message: '此電子郵件已經註冊'
      })
    }

    // 建立新用戶
    // 這裡應該是實際的資料庫操作
    const user = {
      email,
      name,
      phone,
      birthday,
      status: 'active',
      role: 'user',
      createdAt: new Date().toISOString()
    }

    return res.status(201).json({
      success: true,
      message: '註冊成功',
      user
    })

  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({
      success: false,
      message: '註冊時發生錯誤'
    })
  }
} 
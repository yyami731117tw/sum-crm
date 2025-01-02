import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' })
  }

  try {
    const { name, email, password } = req.body

    // 驗證必要欄位
    if (!name || !email || !password) {
      return res.status(400).json({ message: '所有欄位都是必填的' })
    }

    // 檢查信箱是否已被使用
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: '此信箱已被註冊' })
    }

    // 密碼加密
    const hashedPassword = await hash(password, 12)

    // 創建新用戶
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'guest',      // 預設角色為訪客
        status: 'pending',  // 預設狀態為待審核
        joinDate: new Date().toISOString(),
        lastLogin: null
      }
    })

    // 移除密碼後回傳用戶資料
    const { password: _, ...userWithoutPassword } = user

    // TODO: 發送歡迎郵件
    // TODO: 通知管理員有新用戶註冊

    return res.status(201).json({
      message: '註冊成功，請等待管理員審核',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('註冊錯誤:', error)
    return res.status(500).json({ message: '註冊過程發生錯誤' })
  }
} 
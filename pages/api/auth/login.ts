import type { NextApiRequest, NextApiResponse } from 'next'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' })
  }

  try {
    const { email, password } = req.body

    // 驗證必要欄位
    if (!email || !password) {
      return res.status(400).json({ message: '請輸入信箱和密碼' })
    }

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ message: '信箱或密碼錯誤' })
    }

    // 驗證密碼
    const isValid = await compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: '信箱或密碼錯誤' })
    }

    // 檢查用戶狀態
    if (user.status === 'inactive') {
      return res.status(403).json({ message: '您的帳號已被停用，請聯繫管理員' })
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: '您的帳號正在審核中，請耐心等待' })
    }

    // 更新最後登入時間
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // 創建 JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    // 設置 cookie
    res.setHeader(
      'Set-Cookie',
      `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}`
    )

    // 移除密碼後回傳用戶資料
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      message: '登入成功',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('登入錯誤:', error)
    return res.status(500).json({ message: '登入過程發生錯誤' })
  }
} 
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
    // 使用預設的管理員帳號
    const email = 'admin@mbc.com'
    const password = 'admin123'

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      return res.status(401).json({ message: '用戶不存在' })
    }

    // 驗證密碼
    const isValid = await compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: '密碼錯誤' })
    }

    // 檢查用戶狀態
    if (user.status === 'inactive') {
      return res.status(403).json({ message: '帳號已被停用' })
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: '帳號正在審核中' })
    }

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

    return res.status(200).json({
      message: '登入成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    })
  } catch (error) {
    console.error('登入錯誤:', error)
    return res.status(500).json({ message: '登入過程發生錯誤' })
  }
} 
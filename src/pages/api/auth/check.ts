import type { NextApiRequest, NextApiResponse } from 'next'
import { verify } from 'jsonwebtoken'
import prisma from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許 GET 請求' })
  }

  try {
    const session = req.cookies.session

    if (!session) {
      return res.status(401).json({ message: '未登入' })
    }

    // 驗證 JWT token
    const decoded = verify(session, JWT_SECRET) as {
      id: string
      email: string
      role: string
      status: string
    }

    // 從資料庫獲取最新的用戶資料
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      return res.status(401).json({ message: '用戶不存在' })
    }

    // 檢查用戶狀態
    if (user.status === 'inactive') {
      return res.status(403).json({ message: '帳號已被停用' })
    }

    // 移除密碼後回傳用戶資料
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('認證檢查錯誤:', error)
    return res.status(401).json({ message: '認證無效' })
  }
} 
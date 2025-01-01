import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 模擬用戶數據
const mockUsers = [
  {
    id: '1',
    email: 'admin@mbc.com',
    password: 'admin123',
    name: '管理員',
    role: 'admin',
    status: 'active'
  }
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允許' })
  }

  try {
    // 從 cookie 中獲取 token
    const token = req.cookies.auth

    if (!token) {
      return res.status(401).json({ success: false, message: '未登入' })
    }

    // 驗證 token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }

    // 查找用戶
    const user = mockUsers.find(u => u.id === decoded.userId)

    if (!user) {
      return res.status(401).json({ success: false, message: '用戶不存在' })
    }

    // 返回用戶資訊（不包含密碼）
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return res.status(401).json({
      success: false,
      message: '驗證失敗'
    })
  }
} 
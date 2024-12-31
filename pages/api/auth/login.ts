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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允許' })
  }

  const { email, password } = req.body

  try {
    // 檢查是否有此用戶
    const user = mockUsers.find(u => u.email === email)
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'NOT_REGISTERED',
        message: '此電子郵件尚未註冊'
      })
    }

    // 驗證密碼
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '密碼錯誤'
      })
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    // 返回用戶資訊（不包含密碼）
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      message: '登入時發生錯誤'
    })
  }
} 
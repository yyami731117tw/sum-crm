import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import { Role } from '@/utils/permissions'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 模擬用戶數據
const mockUsers = [
  {
    id: '1',
    email: 'admin@mbc.com',
    password: 'Admin123',
    name: '管理員',
    role: 'admin' as Role,
    status: 'active'
  }
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 設置 CORS 頭
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  // 在開發環境中使用具體的域名
  const origin = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : process.env.NEXT_PUBLIC_BASE_URL
  res.setHeader('Access-Control-Allow-Origin', origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'METHOD_NOT_ALLOWED',
      message: '方法不允許' 
    })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: '請輸入電子郵件和密碼'
      })
    }

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

    // 檢查用戶狀態
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'ACCOUNT_INACTIVE',
        message: '帳號未啟用'
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

    // 設置 cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      })
    )

    // 返回用戶資訊（不包含密碼）
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: '登入時發生錯誤'
    })
  }
} 
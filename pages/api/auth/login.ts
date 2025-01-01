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
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

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

    res.status(200).json({
      success: true,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: '登入時發生錯誤'
    })
  }
} 
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
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
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept'
  )

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'METHOD_NOT_ALLOWED',
      message: '方法不允許' 
    })
  }

  try {
    // 從 cookie 中獲取 token
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'NOT_AUTHENTICATED',
        message: '未登入' 
      })
    }

    // 驗證 token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: Role }

    // 查找用戶
    const user = mockUsers.find(u => u.id === decoded.userId)

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'USER_NOT_FOUND',
        message: '用戶不存在' 
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
      error: 'AUTHENTICATION_FAILED',
      message: '驗證失敗'
    })
  }
} 
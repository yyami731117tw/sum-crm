import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const { email, step, password } = req.body

    // 預設管理員帳號
    const adminUser = {
      id: 'admin-001',
      email: 'admin@mbc.com',
      password: 'admin123',
      name: '系統管理員',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLogin: new Date().toISOString()
    }

    // 步驟 1: 檢查電子郵件
    if (step === 1) {
      // 檢查是否為管理員
      if (email === adminUser.email) {
        return res.status(200).json({
          success: true,
          exists: true,
          message: '請輸入密碼'
        })
      }

      // 模擬檢查用戶是否存在
      const userExists = false // 這裡應該是實際的資料庫查詢
      
      if (!userExists) {
        return res.status(404).json({ 
          success: false,
          error: 'NOT_REGISTERED',
          message: '此電子郵件尚未註冊' 
        })
      }

      return res.status(200).json({
        success: true,
        exists: true,
        message: '請輸入密碼'
      })
    }

    // 步驟 2: 驗證密碼
    if (step === 2) {
      if (email === adminUser.email) {
        if (password === adminUser.password) {
          return res.status(200).json({
            success: true,
            token: 'admin-token',
            user: adminUser
          })
        }
      }

      // 密碼錯誤
      return res.status(401).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: '密碼錯誤'
      })
    }

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ 
      success: false, 
      message: '登入時發生錯誤' 
    })
  }
} 
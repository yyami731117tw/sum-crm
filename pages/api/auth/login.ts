import type { NextApiRequest, NextApiResponse } from 'next'
import { sign } from 'jsonwebtoken'

// 模擬管理員用戶
const adminUser = {
  id: '1',
  email: 'admin@sum-crm.com',
  password: 'admin123',
  name: '系統管理員',
  role: 'admin',
  status: 'active'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const { email, step, password } = req.body
    console.log('Login request:', { email, step, password: '***' })

    // 步驟 1: 檢查電子郵件
    if (step === 1) {
      console.log('Step 1: Checking email')
      // 檢查是否為管理員
      if (email === adminUser.email) {
        console.log('Admin email found')
        return res.status(200).json({
          success: true,
          exists: true,
          message: '請輸入密碼'
        })
      }

      // 模擬檢查用戶是否存在
      const userExists = false // 這裡應該是實際的資料庫查詢
      console.log('User exists:', userExists)
      
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
      console.log('Step 2: Verifying password')
      if (email === adminUser.email) {
        if (password === adminUser.password) {
          console.log('Admin login successful')
          // 生成 JWT token
          const token = sign(
            {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          )

          // 設置 cookie
          res.setHeader('Set-Cookie', `auth=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);

          return res.status(200).json({
            success: true,
            token,
            user: {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role,
              status: adminUser.status
            }
          })
        }
      }

      // 密碼錯誤
      console.log('Invalid password')
      return res.status(401).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: '密碼錯誤'
      })
    }

    return res.status(400).json({
      success: false,
      error: 'INVALID_STEP',
      message: '無效的登入步驟'
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      message: '登入時發生錯誤'
    })
  }
} 
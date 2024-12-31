import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const authHeader = req.headers.authorization
    console.log('Auth header:', authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: '未提供認證令牌' 
      })
    }

    const token = authHeader.split(' ')[1]
    console.log('Verifying token:', token)

    // 這裡應該是實際的 token 驗證邏輯
    // 目前僅檢查是否為管理員 token
    if (token.startsWith('admin-token-')) {
      // 預設管理員用戶
      const adminUser = {
        id: 'admin-001',
        email: 'admin@mbc.com',
        name: '系統管理員',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: new Date().toISOString()
      }

      return res.status(200).json({
        success: true,
        user: adminUser
      })
    }

    return res.status(401).json({ 
      success: false,
      message: '無效的認證令牌' 
    })

  } catch (error) {
    console.error('Verify error:', error)
    return res.status(500).json({ 
      success: false,
      message: '驗證時發生錯誤' 
    })
  }
} 
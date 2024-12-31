import type { NextApiRequest, NextApiResponse } from 'next'

interface VerifyData {
  verificationToken: string
  verificationCode: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const { verificationToken, verificationCode } = req.body as VerifyData

    if (!verificationToken || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: '驗證資料不完整'
      })
    }

    // TODO: 從資料庫中查找對應的驗證資訊
    const verificationInfo = {
      code: '123456', // 這裡應該是從資料庫中獲取的驗證碼
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分鐘後過期
      isUsed: false
    }

    // 檢查驗證碼是否正確
    if (verificationCode !== verificationInfo.code) {
      return res.status(400).json({
        success: false,
        message: '驗證碼不正確'
      })
    }

    // 檢查驗證碼是否過期
    if (new Date() > verificationInfo.expiresAt) {
      return res.status(400).json({
        success: false,
        message: '驗證碼已過期'
      })
    }

    // 檢查驗證碼是否已使用
    if (verificationInfo.isUsed) {
      return res.status(400).json({
        success: false,
        message: '驗證碼已使用'
      })
    }

    // TODO: 更新用戶狀態為已驗證
    // TODO: 標記驗證碼為已使用

    return res.status(200).json({
      success: true,
      message: '驗證成功'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return res.status(500).json({
      success: false,
      message: '驗證過程發生錯誤'
    })
  }
} 
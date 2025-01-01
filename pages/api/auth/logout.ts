import { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' })
  }

  try {
    // 清除 token cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        sameSite: 'lax',
        path: '/'
      })
    )

    return res.status(200).json({ success: true, message: '登出成功' })
  } catch (error) {
    console.error('登出時發生錯誤:', error)
    return res.status(500).json({ success: false, message: '登出時發生錯誤' })
  }
} 
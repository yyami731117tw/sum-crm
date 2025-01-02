import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' })
  }

  try {
    // 清除 session cookie
    res.setHeader(
      'Set-Cookie',
      'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    )

    return res.status(200).json({ message: '登出成功' })
  } catch (error) {
    console.error('登出錯誤:', error)
    return res.status(500).json({ message: '登出過程發生錯誤' })
  }
} 
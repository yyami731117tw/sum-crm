import type { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '../../../utils/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    // 清除 session cookie
    res.setHeader(
      'Set-Cookie',
      'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    )

    logger.info('User logged out successfully')
    
    return res.status(200).json({
      success: true,
      message: '登出成功'
    })
  } catch (error) {
    logger.error('Logout error', { error: error as Error })
    return res.status(500).json({
      success: false,
      message: '登出時發生錯誤'
    })
  }
} 
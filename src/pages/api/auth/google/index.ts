import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoogleAuthUrl } from '@/utils/google-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const authUrl = getGoogleAuthUrl()
    res.redirect(authUrl)
  } catch (error) {
    console.error('Google 授權 URL 生成失敗:', error)
    res.status(500).json({ message: '無法啟動 Google 登入' })
  }
} 
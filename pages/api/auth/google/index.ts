import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoogleAuthUrl } from '../../../../utils/google-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const authUrl = await getGoogleAuthUrl()
    res.redirect(authUrl)
  } catch (error) {
    console.error('Google auth initialization error:', error)
    res.redirect('/signup?error=google_auth_init_failed')
  }
} 
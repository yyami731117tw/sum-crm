import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoogleUserInfo } from '../../../../utils/google-auth'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail, generateVerificationEmailContent } from '../../../../utils/email'
import { logger } from '../../../../utils/logger'
import { createSession } from '../../../../utils/auth'
import { PrismaClient } from '@prisma/client'
import { OAuth2Client } from 'google-auth-library'
import cookie from 'cookie'
import google from 'googleapis'

const prisma = new PrismaClient()

// 設置會話過期時間為 30 天
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允許' })
  }

  const { code } = req.query

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: '無效的授權碼' })
  }

  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // 獲取訪問令牌
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // 獲取用戶信息
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data } = await oauth2.userinfo.get()

    if (!data.email || !data.verified_email) {
      return res.status(400).json({ 
        error: 'email_not_verified',
        message: '您的 Google 帳號尚未驗證電子郵件'
      })
    }

    // 查找或創建用戶
    let user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name || '',
          image: data.picture,
          role: 'user',
          emailVerified: new Date()
        }
      })
    }

    // 創建會話
    const session = await createSession({
      id: uuidv4(),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY)
    })

    // 設置會話 cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('session', session.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_EXPIRY / 1000 // 轉換為秒
      })
    )

    // 重定向到儀表板
    res.redirect(302, '/dashboard')
  } catch (error) {
    console.error('Google 認證錯誤:', error)
    res.redirect(302, '/login?error=google_auth_failed')
  }
} 
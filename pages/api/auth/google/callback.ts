import type { NextApiRequest, NextApiResponse } from 'next'
import { getGoogleUserInfo } from '../../../../utils/google-auth'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail, generateVerificationEmailContent } from '../../../../utils/email'
import { logger } from '../../../../utils/logger'
import { createSession } from '../../../../utils/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const requestId = uuidv4()

  if (req.method !== 'GET') {
    logger.warn('Invalid method for Google callback', {
      requestId,
      invalidMethod: req.method
    })
    return res.status(405).json({ message: '方法不允許' })
  }

  const { code, error } = req.query

  if (error) {
    logger.error('Google OAuth error', {
      requestId,
      oauthError: error,
      queryParams: req.query
    })
    return res.redirect('/signup?error=google_auth_failed')
  }

  if (!code || typeof code !== 'string') {
    logger.warn('Invalid or missing code', {
      requestId,
      receivedCode: code
    })
    return res.redirect('/signup?error=invalid_code')
  }

  try {
    logger.info('Processing Google OAuth callback', { requestId })

    // 獲取 Google 用戶信息
    const userInfo = await getGoogleUserInfo(code)
    logger.debug('Received Google user info', {
      requestId,
      userEmail: userInfo.email
    })

    if (!userInfo.verified_email) {
      logger.warn('Unverified Google email', {
        requestId,
        userEmail: userInfo.email
      })
      return res.redirect('/signup?error=email_not_verified')
    }

    // TODO: 檢查用戶是否已存在
    const userExists = false // 這裡應該是實際的資料庫查詢

    if (userExists) {
      logger.info('User already exists', {
        requestId,
        userEmail: userInfo.email
      })
      return res.redirect('/login?error=user_exists')
    }

    // 生成驗證碼和令牌
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationToken = uuidv4()

    // 建立新用戶
    const user = {
      id: uuidv4(),
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      googleId: userInfo.id,
      status: 'pending',
      role: 'user',
      verificationCode,
      verificationToken,
      createdAt: new Date().toISOString()
    }

    // 發送驗證郵件
    logger.info('Sending verification email', {
      requestId,
      userEmail: user.email
    })
    const emailContent = generateVerificationEmailContent(user.name, verificationCode)
    const emailResult = await sendEmail({
      to: user.email,
      subject: '多元商會員系統 - 電子郵件驗證',
      html: emailContent
    })

    if (!emailResult.success) {
      logger.error('Failed to send verification email', {
        requestId,
        userEmail: user.email,
        error: new Error(emailResult.error)
      })
      return res.redirect('/signup?error=verification_email_failed')
    }

    // 創建會話
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      googleId: user.googleId
    })

    // TODO: 將用戶資料儲存到資料庫
    logger.info('New Google user created', {
      requestId,
      userId: user.id,
      userEmail: user.email
    })

    // 重定向到驗證頁面
    return res.redirect(`/verify?token=${verificationToken}`)

  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error')
    logger.error('Google signup error', {
      requestId,
      error: err,
      authCode: code
    })
    return res.redirect('/signup?error=signup_failed')
  }
} 
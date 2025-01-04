import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import { createSession } from '@/utils/auth'
import { PrismaClient } from '@prisma/client'
import { getGoogleTokens, verifyGoogleToken } from '@/utils/google-auth'
import cookie from 'cookie'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允許' })
  }

  const { code } = req.query

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: '缺少授權碼' })
  }

  try {
    const tokens = await getGoogleTokens(code)
    if (!tokens || !tokens.id_token) {
      return res.status(400).json({ message: '無效的 Google 令牌' })
    }

    const payload = await verifyGoogleToken(tokens.id_token)
    if (!payload) {
      return res.status(400).json({ message: '無效的 Google 令牌' })
    }

    const { email, name, picture } = payload

    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email?.split('@')[0],
          image: picture,
          emailVerified: new Date(),
          role: 'guest',
          status: 'active'
        }
      })
    }

    const sessionToken = uuidv4()
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await createSession({
      userId: user.id,
      expiresAt: sessionExpiry
    })

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('next-auth.session-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: sessionExpiry
      })
    )

    return res.redirect('/')
  } catch (error) {
    console.error('Google 登入失敗:', error)
    return res.status(500).json({ message: '登入失敗，請稍後再試' })
  }
} 
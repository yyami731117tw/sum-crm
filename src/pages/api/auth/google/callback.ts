import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import { createSession } from '@/utils/auth'
import { PrismaClient } from '@prisma/client'
import { OAuth2Client } from 'google-auth-library'
import cookie from 'cookie'

const prisma = new PrismaClient()
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

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
    const { tokens } = await client.getToken(code)
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()

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

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: sessionExpiry
      }
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
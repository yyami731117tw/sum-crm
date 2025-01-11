import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允許 POST 請求' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '請輸入信箱和密碼' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true
      }
    })

    if (!user || !user.password) {
      return res.status(401).json({ error: '信箱或密碼錯誤' })
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: '信箱或密碼錯誤' })
    }

    const token = sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      process.env.NEXTAUTH_SECRET || '',
      { expiresIn: '30d' }
    )

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: '登入時發生錯誤，請稍後再試' })
  }
} 
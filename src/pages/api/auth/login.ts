import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 設置 CORS 頭
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: '只允許 POST 請求' 
    })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: '請輸入信箱和密碼' 
      })
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
      return res.status(401).json({ 
        success: false,
        error: '信箱或密碼錯誤' 
      })
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        error: '信箱或密碼錯誤' 
      })
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

    // 設置 cookie
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`
    )

    const response = {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ 
      success: false,
      error: '登入時發生錯誤，請稍後再試' 
    })
  }
} 
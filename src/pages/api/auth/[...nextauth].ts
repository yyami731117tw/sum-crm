import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('請輸入電子郵件和密碼')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
            status: true
          }
        })

        if (!user || !user.password) {
          throw new Error('找不到使用者')
        }

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('密碼錯誤')
        }

        if (user.status !== 'active') {
          throw new Error('帳號尚未啟用')
        }

        return {
          id: user.id,
          email: user.email || '',
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 天
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // 設置 CORS 頭
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 處理 session 請求
  if (req.method === 'GET' && req.url?.includes('/api/auth/session')) {
    try {
      const result = await NextAuth(req, res, authOptions)
      return result
    } catch (error) {
      console.error('Session error:', error)
      return res.status(200).json({ user: null })
    }
  }

  // 處理其他 NextAuth 請求
  try {
    return await NextAuth(req, res, authOptions)
  } catch (error) {
    console.error('NextAuth error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export default handler 
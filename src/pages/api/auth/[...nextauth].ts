import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('請輸入電子郵件和密碼')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            throw new Error('找不到使用者')
          }

          const isValid = await compare(credentials.password, user.password)
          if (!isValid) {
            throw new Error('密碼錯誤')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Authorization Error:', error)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'https://sum-crm.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // 確保請求內容類型正確
    if (req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json')
    }
    
    await NextAuth(req, res, authOptions)
  } catch (error) {
    console.error('NextAuth Error:', error)
    res.status(500).json({ error: '登入過程發生錯誤' })
  }
} 
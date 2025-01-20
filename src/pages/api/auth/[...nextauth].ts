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
        console.log('Authorize function called with credentials:', credentials?.email)

        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            throw new Error('請輸入電子郵件和密碼')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('User found:', user ? 'Yes' : 'No')

          if (!user || !user.password) {
            console.log('User not found or no password')
            throw new Error('找不到使用者')
          }

          const isValid = await compare(credentials.password, user.password)
          console.log('Password valid:', isValid)

          if (!isValid) {
            throw new Error('密碼錯誤')
          }

          if (user.status !== 'active') {
            throw new Error('帳號尚未啟用')
          }

          // 更新最後登入時間
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Authorization error:', error)
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
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
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

// 創建一個包裝函數來處理 NextAuth
const handleNextAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  return await NextAuth(req, res, authOptions)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Auth API called:', req.method, req.url)

  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // 測試資料庫連接
    try {
      await prisma.$connect()
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return res.status(500).json({ error: '資料庫連接失敗' })
    }

    // 設置響應頭
    res.setHeader('Content-Type', 'application/json')
    
    // 處理 NextAuth
    return handleNextAuth(req, res)
  } catch (error) {
    console.error('NextAuth Error:', error)
    return res.status(500).json({ 
      error: '登入過程發生錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    })
  } finally {
    await prisma.$disconnect()
  }
} 
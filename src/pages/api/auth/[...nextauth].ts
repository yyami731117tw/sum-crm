import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'

// 初始化 Prisma 客戶端
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
})

// 測試資料庫連接的函數
async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    // 測試查詢
    const userCount = await prisma.user.count()
    console.log('Database connection successful, user count:', userCount)
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return false
  }
}

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

          const isConnected = await testDatabaseConnection()
          if (!isConnected) {
            throw new Error('資料庫連接失敗')
          }

          const email = credentials.email.toLowerCase().trim()
          const user = await prisma.user.findUnique({
            where: { email },
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

          await prisma.user.update({
            where: { id: user.id },
            data: { 
              lastLoginAt: new Date(),
              updatedAt: new Date()
            }
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
  debug: true,
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback - Token:', token)
      console.log('JWT Callback - User:', user)
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback - Session:', session)
      console.log('Session Callback - Token:', token)
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Auth API called:', req.method, req.url)
  console.log('Request headers:', req.headers)
  console.log('Request body:', req.body)

  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
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
    // 確保請求方法是 POST 或 GET
    if (!['POST', 'GET'].includes(req.method || '')) {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // 測試資料庫連接
    const isConnected = await testDatabaseConnection()
    if (!isConnected) {
      return res.status(500).json({ error: '資料庫連接失敗' })
    }

    return await NextAuth(req, res, authOptions)
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
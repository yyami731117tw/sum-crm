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
    return false
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('請輸入電子郵件和密碼')
        }

        const isConnected = await testDatabaseConnection()
        if (!isConnected) {
          throw new Error('資料庫連接失敗')
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

// 處理 CORS 請求
function setCorsHeaders(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 處理 CORS
  setCorsHeaders(req, res)

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // 確保請求方法是 POST 或 GET
    if (!['POST', 'GET'].includes(req.method || '')) {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: '不支援的請求方法'
      })
    }

    // 測試資料庫連接
    const isConnected = await testDatabaseConnection()
    if (!isConnected) {
      return res.status(500).json({ 
        error: 'Database connection failed',
        message: '資料庫連接失敗'
      })
    }

    // 設置回應標頭
    res.setHeader('Content-Type', 'application/json')

    // 處理 NextAuth
    const nextAuthResponse = await NextAuth(req, res, authOptions)
    return nextAuthResponse
  } catch (error) {
    console.error('NextAuth Error:', error)
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : '登入過程發生錯誤'
    })
  } finally {
    await prisma.$disconnect()
  }
} 
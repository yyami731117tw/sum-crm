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
        console.log('Starting authorization process for:', credentials?.email)
        console.log('Request headers:', req?.headers)
        console.log('Request body:', req?.body)

        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          throw new Error('請輸入電子郵件和密碼')
        }

        try {
          // 測試資料庫連接
          const isConnected = await testDatabaseConnection()
          if (!isConnected) {
            console.error('Database connection failed during authorization')
            throw new Error('資料庫連接失敗')
          }

          const email = credentials.email.toLowerCase().trim()
          console.log('Looking up user with email:', email)

          // 查找用戶
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

          console.log('User lookup result:', user ? {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            hasPassword: !!user.password
          } : 'Not found')

          if (!user) {
            console.log('User not found:', email)
            throw new Error('找不到使用者')
          }

          if (!user.password) {
            console.log('User has no password set:', email)
            throw new Error('使用者密碼未設置')
          }

          // 驗證密碼
          console.log('Validating password for user:', email)
          const isValid = await compare(credentials.password, user.password)
          console.log('Password validation:', isValid ? 'Success' : 'Failed')

          if (!isValid) {
            console.log('Invalid password for user:', email)
            throw new Error('密碼錯誤')
          }

          if (user.status !== 'active') {
            console.log('Inactive user attempted login:', email)
            throw new Error('帳號尚未啟用')
          }

          // 更新最後登入時間
          console.log('Updating last login time for user:', email)
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              lastLoginAt: new Date(),
              updatedAt: new Date()
            }
          })

          console.log('Login successful for user:', email)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Authorization error:', error)
          if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
          }
          throw error
        } finally {
          await prisma.$disconnect()
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
    const isConnected = await testDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection test failed in handler')
      return res.status(500).json({ error: '資料庫連接失敗' })
    }

    // 設置響應頭
    res.setHeader('Content-Type', 'application/json')
    
    // 處理 NextAuth
    const response = await NextAuth(req, res, authOptions)
    console.log('NextAuth response:', response)
    return response
  } catch (error) {
    console.error('NextAuth Error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return res.status(500).json({ 
      error: '登入過程發生錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    })
  } finally {
    await prisma.$disconnect()
  }
} 
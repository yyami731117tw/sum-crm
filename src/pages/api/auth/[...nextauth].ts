import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials:', { email: !!credentials?.email, password: !!credentials?.password })
          throw new Error('請輸入信箱和密碼')
        }

        try {
          console.log('Attempting login for email:', credentials.email)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
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
            console.error('User not found or no password:', { email: credentials.email })
            throw new Error('信箱或密碼錯誤')
          }

          const isValid = await compare(credentials.password, user.password)
          if (!isValid) {
            console.error('Invalid password for user:', { email: credentials.email })
            throw new Error('信箱或密碼錯誤')
          }

          console.log('Login successful for user:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status
          }
        } catch (error) {
          console.error('Authorization error:', error)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    }
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Auth request:', req.method, req.url)
  
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    await NextAuth(req, res, authOptions)
  } catch (error) {
    console.error('NextAuth error:', error)
    res.status(500).json({ 
      error: '認證服務發生錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    })
  }
} 
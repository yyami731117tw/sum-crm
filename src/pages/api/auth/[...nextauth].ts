import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return await NextAuth(req, res, authOptions)
}

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
          throw new Error('請輸入信箱和密碼')
        }

        try {
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email,
              status: 'ACTIVE'
            },
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
            console.log('User not found:', credentials.email)
            throw new Error('信箱或密碼錯誤')
          }

          const isValid = await compare(credentials.password, user.password)
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email)
            throw new Error('信箱或密碼錯誤')
          }

          console.log('Login successful for user:', credentials.email)
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
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
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
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET
}

export default handler 
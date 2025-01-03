import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'
import type { User } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('缺少認證資訊')
            throw new Error('請輸入信箱和密碼')
          }

          console.log('嘗試認證使用者:', credentials.email)

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              status: true,
              phone: true,
              lineId: true,
              address: true,
              birthday: true,
              image: true
            }
          })

          console.log('找到使用者:', user ? '是' : '否')

          if (!user || !user.password) {
            console.error('使用者不存在或密碼未設置')
            throw new Error('找不到此使用者')
          }

          const isValid = await compare(credentials.password, user.password)

          console.log('密碼驗證:', isValid ? '成功' : '失敗')

          if (!isValid) {
            console.error('密碼驗證失敗')
            throw new Error('密碼錯誤')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            phone: user.phone,
            lineId: user.lineId,
            address: user.address,
            birthday: user.birthday?.toISOString().split('T')[0],
            image: user.image
          }
        } catch (error) {
          console.error('認證過程中發生錯誤:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
        token.phone = user.phone
        token.lineId = user.lineId
        token.address = user.address
        token.birthday = user.birthday
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
        session.user.phone = token.phone as string | null
        session.user.lineId = token.lineId as string | null
        session.user.address = token.address as string | null
        session.user.birthday = token.birthday as string | null
      }
      return session
    }
  }
}

export default NextAuth(authOptions) 
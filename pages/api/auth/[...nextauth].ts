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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('請輸入信箱和密碼')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        }) as User

        if (!user) {
          throw new Error('找不到此使用者')
        }

        const isValid = await compare(credentials.password, user.password)

        if (!isValid) {
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
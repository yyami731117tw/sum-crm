import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'

// 擴展 next-auth 的型別
declare module "next-auth" {
  interface User {
    readonly id: string
    readonly email: string
    readonly role: string
    readonly status: string
    readonly name?: string | null
  }
  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    readonly id: string
    readonly email: string
    readonly role: string
    readonly status: string
    readonly name?: string | null
  }
}

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
            throw new Error('請輸入信箱和密碼')
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            throw new Error('信箱或密碼錯誤')
          }

          const isValid = await compare(credentials.password, user.password)
          if (!isValid) {
            throw new Error('信箱或密碼錯誤')
          }

          if (user.status === 'inactive') {
            throw new Error('account_disabled')
          }

          if (user.status === 'pending') {
            throw new Error('account_pending')
          }

          return {
            id: user.id,
            email: user.email || '',
            role: user.role,
            status: user.status,
            name: user.name
          }
        } catch (error) {
          console.error('認證錯誤:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  cookies: {
    sessionToken: {
      name: 'session',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.status = user.status
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.role = token.role
        session.user.status = token.status
        session.user.name = token.name
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === 'development'
}

export default NextAuth(authOptions) 
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { AUTH_ERRORS } from '@/utils/errorMessages'
import { Prisma } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('invalid_credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error('invalid_credentials')
        }

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('invalid_credentials')
        }

        if (user.status === 'inactive') {
          throw new Error('account_disabled')
        }

        if (user.status === 'pending') {
          throw new Error('account_pending')
        }

        if (!user.emailVerified) {
          throw new Error('email_not_verified')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          scope: 'openid profile email'
        }
      },
      async profile(profile) {
        // 檢查並同步 Google 用戶
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email }
        })

        if (existingUser) {
          // 更新現有用戶資訊
          await prisma.user.update({
            where: { email: profile.email },
            data: {
              name: profile.name,
              image: profile.picture,
              emailVerified: new Date()
            }
          })
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: existingUser?.role || 'user', // 保留現有角色或預設
          status: existingUser?.status || 'active'
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (account?.provider === 'google') {
        // 使用型別斷言安全地檢查 email_verified
        const googleProfile = profile as { email_verified?: boolean }
        const isEmailVerified = googleProfile.email_verified === true
        
        if (!isEmailVerified) {
          throw new Error('google_email_not_verified')
        }
        
        // 安全地檢查 email
        const userEmail = user.email
        if (userEmail) {
          // 使用原始 SQL 查詢繞過型別檢查
          await prisma.$executeRaw`
            UPDATE users 
            SET "lastLoginAt" = NOW()
            ${isNewUser ? `,"registeredAt" = NOW(), "status" = 'active'` : ''}
            WHERE email = ${userEmail}
          `

          console.log(`Google user ${isNewUser ? 'registered' : 'logged in'}: ${userEmail}`)
        }
      }
    },
    async createUser(message) {
      try {
        const userEmail = message.user.email
        if (userEmail) {
          // 使用原始 SQL 查詢繞過型別檢查
          await prisma.$executeRaw`
            UPDATE users 
            SET "registeredAt" = NOW(), 
                "status" = 'active'
            WHERE email = ${userEmail}
          `
          
          console.log(`User created and initialized: ${userEmail}`)
        }
      } catch (error) {
        console.error('Error processing new user:', error)
      }
    }
  }
}

export default NextAuth(authOptions) 
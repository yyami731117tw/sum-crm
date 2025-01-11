import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials')
          throw new Error('請輸入信箱和密碼')
        }

        try {
          console.log('Attempting login for:', credentials.email)
          
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
            console.error('User not found:', credentials.email)
            throw new Error('信箱或密碼錯誤')
          }

          const isValid = await compare(credentials.password, user.password)
          if (!isValid) {
            console.error('Invalid password for:', credentials.email)
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
    signIn: '/auth/login',
    error: '/auth/error',
    signOut: '/auth/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('Setting JWT token for user:', user.email)
        token.id = user.id
        token.role = user.role
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('Setting session for user:', session.user.email)
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      if (url.startsWith('/auth/error')) {
        return `${baseUrl}/auth/error?error=登入失敗，請檢查信箱和密碼`
      }
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
    }
  }
}

export default NextAuth(authOptions) 
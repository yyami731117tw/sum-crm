import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'

export const authOptions: AuthOptions = {
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
          console.log(`Login failed: User not found - ${credentials.email}`)
          throw new Error('信箱或密碼錯誤')
        }

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) {
          console.log(`Login failed: Invalid password - ${credentials.email}`)
          throw new Error('信箱或密碼錯誤')
        }

        console.log(`Login successful: ${user.email} (${user.role})`)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
        console.log('JWT token created:', { id: token.id, role: token.role })
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
        console.log('Session updated:', { 
          id: session.user.id, 
          role: session.user.role 
        })
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      
      // 如果是錯誤頁面，直接返回
      if (url.includes('/auth/error')) {
        return url
      }
      
      // 如果是登入頁面，重定向到首頁
      if (url.includes('/login')) {
        return baseUrl
      }
      
      // 如果是相對路徑，加上 baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // 如果是完整 URL，確保是同一域名
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // 預設重定向到首頁
      return baseUrl
    }
  },
  debug: process.env.NODE_ENV === 'development'
}

export default NextAuth(authOptions) 
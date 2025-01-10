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
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
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
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            console.log('User not found or no password')
            return null
          }

          const isValid = await compare(credentials.password, user.password)
          if (!isValid) {
            console.log('Invalid password')
            return null
          }

          if (user.status === 'inactive') {
            console.log('Account disabled')
            return null
          }

          if (user.status === 'pending') {
            console.log('Account pending')
            return null
          }

          if (!user.emailVerified) {
            console.log('Email not verified')
            return null
          }

          console.log('Login successful:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
          }
        } catch (error) {
          console.error('Login error:', error)
          return null
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
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email }
          })

          if (existingUser) {
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
            role: existingUser?.role || 'user',
            status: existingUser?.status || 'active'
          }
        } catch (error) {
          console.error('Google profile error:', error)
          throw error
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          const googleProfile = profile as { email_verified?: boolean }
          const isEmailVerified = googleProfile.email_verified === true
          
          if (!isEmailVerified) {
            console.log('Google email not verified')
            return false
          }
        }
        console.log('Sign in successful:', user.email)
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
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
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
export default handler 
import NextAuth, { type NextAuthOptions, type DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'

interface ExtendedUser {
  role: string
  status: string
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser & DefaultSession["user"]
  }

  interface User extends ExtendedUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends ExtendedUser {}
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user?.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email || '',
          role: user.role,
          status: user.status,
          image: user.image
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
          status: user.status
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
          status: token.status
        }
      }
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const
  }
}

export default NextAuth(authOptions) 
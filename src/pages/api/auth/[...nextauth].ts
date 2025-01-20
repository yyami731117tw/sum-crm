import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', ['POST'])
    return res.status(200).end()
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authOptions: AuthOptions = {
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
        }
      },
      pages: {
        signIn: '/login',
        error: '/login'
      },
      secret: process.env.NEXTAUTH_SECRET
    }

    return await NextAuth(req, res, authOptions)
  } catch (error) {
    console.error('NextAuth error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default handler 
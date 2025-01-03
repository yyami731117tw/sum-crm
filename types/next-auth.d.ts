import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role?: string
      status?: string
      nickname?: string | null
      phone?: string | null
      lineId?: string | null
      address?: string | null
      birthday?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    password?: string
    role?: string
    status?: string
    nickname?: string | null
    phone?: string | null
    lineId?: string | null
    address?: string | null
    birthday?: string | null
    image?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    status?: string
    nickname?: string | null
    phone?: string | null
    lineId?: string | null
    address?: string | null
    birthday?: string | null
    image?: string | null
  }
} 
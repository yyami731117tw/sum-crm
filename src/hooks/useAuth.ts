import { useSession } from 'next-auth/react'

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
  lineId?: string | null
  address?: string | null
  birthday?: string | null
  role: string
  status: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const user = session?.user as User | undefined

  return {
    user,
    loading,
    isAuthenticated: !!session,
  }
} 
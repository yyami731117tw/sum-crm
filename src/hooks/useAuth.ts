import { useSession, signIn, signOut } from 'next-auth/react'

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

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      })
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  return {
    user,
    loading,
    isAuthenticated: !!session,
    login,
    logout,
  }
} 
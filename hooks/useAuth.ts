import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

interface UseAuthReturn {
  session: any
  status: 'authenticated' | 'loading' | 'unauthenticated'
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      if (result?.error) {
        setError('登入失敗，請檢查您的信箱和密碼')
        return false
      }

      return true
    } catch (error) {
      setError('登入時發生錯誤，請稍後再試')
      return false
    }
  }

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  return {
    session,
    status,
    error,
    login,
    logout
  }
} 
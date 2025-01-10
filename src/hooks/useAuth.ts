import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'
import { AUTH_ERRORS, getErrorMessage } from '@/utils/errorMessages'

interface UseAuthReturn {
  session: any
  status: 'authenticated' | 'loading' | 'unauthenticated'
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
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
        // 將錯誤代碼轉換為用戶友好的錯誤訊息
        setError(getErrorMessage(result.error))
        return false
      }

      return true
    } catch (error) {
      setError(AUTH_ERRORS.network_error)
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/login' })
    } catch (error) {
      setError(AUTH_ERRORS.network_error)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    session,
    status,
    error,
    login,
    logout,
    clearError
  }
} 
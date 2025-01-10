import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'
import { AUTH_ERRORS, getErrorMessage } from '@/utils/errorMessages'
import { Session } from 'next-auth'

// 擴展 Session 型別
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      status?: string
      phone?: string | null
      lineId?: string | null
      address?: string | null
      birthday?: string | null
      nickname?: string | null
    }
  }
}

interface UseAuthReturn {
  session: Session | null
  status: 'authenticated' | 'loading' | 'unauthenticated'
  error: string | null
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
    status?: string
    phone?: string | null
    lineId?: string | null
    address?: string | null
    birthday?: string | null
    nickname?: string | null
  } | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  updateUser?: (data: any) => Promise<boolean>
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

  const updateUser = async (data: any) => {
    try {
      // 這裡應該實現實際的用戶更新邏輯
      // 可能需要調用 API 端點來更新用戶信息
      console.log('更新用戶信息:', data)
      return true
    } catch (error) {
      console.error('更新用戶信息失敗:', error)
      return false
    }
  }

  return {
    session,
    status,
    error,
    user: session?.user || null,
    loading: status === 'loading',
    login,
    logout,
    clearError,
    updateUser
  }
} 
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

interface LoginCredentials {
  email: string
  password?: string
  step: number
}

interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
}

interface LoginResponse {
  success: boolean
  error?: string
  message?: string
  exists?: boolean
  token?: string
  user?: User
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 檢查用戶是否已登入
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()

      if (data.success && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async ({ email, password, step }: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, step }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.token && data.user) {
          setUser(data.user)
          // 登入成功後重定向到首頁
          router.push('/dashboard')
        }
        return data
      }

      return {
        success: false,
        error: data.error,
        message: data.message
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.error || 'UNKNOWN_ERROR',
        message: error.message || '登入時發生錯誤，請稍後再試' 
      }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    checkAuth
  }
} 
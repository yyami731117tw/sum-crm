import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Role, Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/utils/permissions'

interface User {
  id: string
  email: string
  name: string
  role: Role
}

interface LoginCredentials {
  email: string
  password: string
}

interface ApiResponse<T = any> {
  success: boolean
  error?: string
  message?: string
  data?: T
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Auth check failed')
      }

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      } else {
        setUser(null)
        if (!isPublicRoute(router.pathname)) {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      if (!isPublicRoute(router.pathname)) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password }: LoginCredentials) => {
    try {
      if (!email || !password) {
        return {
          success: false,
          error: 'MISSING_CREDENTIALS',
          message: '請輸入電子郵件和密碼'
        }
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.error || 'API_ERROR',
          message: errorData.message || '登入失敗'
        }
      }

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        return { success: true }
      }

      return {
        success: false,
        error: data.error,
        message: data.message
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: '登入時發生錯誤'
      }
    }
  }

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      const data = await response.json()

      if (data.success) {
        setUser(null)
        router.push('/login')
      }

      return data
    } catch (error) {
      console.error('Logout error:', error)
      return {
        success: false,
        error: 'LOGOUT_FAILED',
        message: '登出時發生錯誤'
      }
    }
  }

  const isPublicRoute = (pathname: string) => {
    return ['/login', '/signup', '/verify', '/terms', '/privacy'].includes(pathname)
  }

  // 權限檢查函數
  const checkPermission = (permission: Permission) => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }

  const checkAnyPermission = (permissions: Permission[]) => {
    if (!user) return false
    return hasAnyPermission(user.role, permissions)
  }

  const checkAllPermissions = (permissions: Permission[]) => {
    if (!user) return false
    return hasAllPermissions(user.role, permissions)
  }

  return {
    user,
    loading,
    login,
    logout,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkAuth
  }
} 
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      } else {
        setUser(null)
        if (router.pathname !== '/login' && 
            router.pathname !== '/signup' && 
            router.pathname !== '/verify' && 
            router.pathname !== '/terms' && 
            router.pathname !== '/privacy') {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      if (router.pathname !== '/login' && 
          router.pathname !== '/signup' && 
          router.pathname !== '/verify' && 
          router.pathname !== '/terms' && 
          router.pathname !== '/privacy') {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password }: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
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
        message: '登入時發生錯誤'
      }
    }
  }

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('登出失敗')
      }

      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
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
    checkAllPermissions
  }
} 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

interface LoginCredentials {
  email: string
  password?: string
  step: number
}

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  name: string
  status: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
        return
      }

      const response = await fetch(`${baseUrl}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data.user)
      } else {
        setIsAuthenticated(false)
        setUser(null)
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password, step }: LoginCredentials) => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, step })
      })

      const data = await response.json()

      if (response.status === 404 && data.error === 'NOT_REGISTERED') {
        return { 
          success: false, 
          error: data.message,
          notRegistered: true 
        }
      }

      if (response.ok && data.exists) {
        return {
          success: false,
          exists: true
        }
      }

      if (response.status === 401 && data.error === 'INVALID_PASSWORD') {
        return {
          success: false,
          error: 'INVALID_PASSWORD',
          message: '密碼錯誤'
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error,
          message: data.message || '登入失敗'
        }
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
        document.cookie = `token=${data.token}; path=/`
        setIsAuthenticated(true)
        setUser(data.user)
        return { success: true }
      }

      return { success: false, error: '登入失敗' }
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
      // 清除 cookie
      Cookies.remove('token')
      
      // 清除本地存儲
      localStorage.removeItem('token')
      
      // 更新狀態
      setIsAuthenticated(false)
      setUser(null)
      
      // 呼叫登出 API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      // 直接跳轉到登入頁面
      window.location.href = '/login'
      
    } catch (error) {
      console.error('登出時發生錯誤:', error)
      // 即使發生錯誤也要跳轉到登入頁面
      window.location.href = '/login'
      throw error
    }
  }

  const isAdmin = () => {
    return user?.role === 'admin' && user?.status === 'active'
  }

  return { isAuthenticated, loading, user, login, logout, isAdmin }
} 
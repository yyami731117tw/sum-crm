import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface LoginCredentials {
  email: string
  password?: string
  step: number
}

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
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

      if (!response.ok) {
        throw new Error(data.message || '登入失敗')
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
        document.cookie = `token=${data.token}; path=/`
        setIsAuthenticated(true)
        return { success: true }
      }

      return { success: false, error: '登入失敗' }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: '登入時發生錯誤，請稍後再試' 
      }
    }
  }

  const logout = async () => {
    try {
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      localStorage.removeItem('token')
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      setIsAuthenticated(false)
      router.push('/login')
    }
  }

  const isAdmin = () => user?.role === 'admin'

  return { isAuthenticated, loading, user, login, logout, isAdmin }
} 
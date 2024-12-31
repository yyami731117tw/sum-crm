import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface LoginCredentials {
  email: string
  password: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
        setLoading(false)
        return
      }

      const response = await fetch(`${baseUrl}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token)
        document.cookie = `token=${data.token}; path=/`
        setIsAuthenticated(true)
        await router.push('/')
        return { success: true }
      }

      return { success: false, error: data.message || '登入失敗' }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: '發生錯誤' }
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
      await router.push('/login')
    }
  }

  return { isAuthenticated, loading, login, logout }
} 
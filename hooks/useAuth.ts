import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { getSession, clearSession } from '../utils/auth'
import type { UserSession } from '../utils/auth'
import Cookies from 'js-cookie'

interface LoginCredentials {
  email: string
  password?: string
  step: number
}

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token')
      
      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          Cookies.remove('token')
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        Cookies.remove('token')
        setIsAuthenticated(false)
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password, step }: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, step })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (data.token) {
          Cookies.set('token', data.token, { 
            expires: 1,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          })
          setUser(data.user)
          setIsAuthenticated(true)
          return { success: true }
        }
      }

      return {
        success: false,
        error: data.error,
        message: data.message,
        exists: data.exists,
        notRegistered: data.error === 'NOT_REGISTERED'
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: '登入時發生錯誤，請稍後再試'
      }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      Cookies.remove('token')
      setUser(null)
      setIsAuthenticated(false)
      router.push('/login')
    }
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    isAdmin
  }
} 
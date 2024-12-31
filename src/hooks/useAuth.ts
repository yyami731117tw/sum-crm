import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import axios from 'axios'

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
      // 優先從 cookie 中獲取 token
      const cookieToken = Cookies.get('token')
      const localToken = localStorage.getItem('token')
      const token = cookieToken || localToken

      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
        return
      }

      // 如果只有其中一個 token，同步另一個
      if (cookieToken && !localToken) {
        localStorage.setItem('token', cookieToken)
      } else if (!cookieToken && localToken) {
        Cookies.set('token', localToken, { path: '/' })
      }

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Auth check response:', data)
        
        if (data.user) {
          setIsAuthenticated(true)
          setUser(data.user)
        } else {
          throw new Error('無效的用戶資料')
        }
      } else {
        // 如果驗證失敗，清除 token
        Cookies.remove('token', { path: '/' })
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setUser(null)
        throw new Error('驗證失敗')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setUser(null)
      // 清除無效的 token
      Cookies.remove('token', { path: '/' })
      localStorage.removeItem('token')
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
      console.log('Login response:', data)

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
        // 先設定 token
        localStorage.setItem('token', data.token)
        document.cookie = `token=${data.token}; path=/`
        
        // 更新用戶狀態
        setUser(data.user)
        setIsAuthenticated(true)
        
        console.log('Login successful:', data.user)
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
      // 先清除本地狀態
      setUser(null)
      localStorage.removeItem('token')
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      
      // 立即重定向到登入頁面
      window.location.replace('/login')
      
      // 在背景執行登出 API 請求
      await axios.post('/api/auth/logout')
    } catch (error) {
      console.error('登出時發生錯誤:', error)
      // 即使 API 請求失敗，也確保用戶被重定向到登入頁面
      window.location.replace('/login')
    }
  }

  const isAdmin = () => {
    // 加入除錯日誌
    console.log('Current user:', user)
    console.log('Is admin?', Boolean(user?.role === 'admin'))
    
    // 確保 user 存在且角色是 admin
    return Boolean(user?.role === 'admin')
  }

  return { isAuthenticated, loading, user, login, logout, isAdmin }
} 
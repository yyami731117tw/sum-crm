import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { getSession, clearSession } from '../utils/auth'
import type { UserSession } from '../utils/auth'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  // 檢查會話狀態
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession()
        setUser(session)
      } catch (error) {
        console.error('Session check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  // 登出功能
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('登出請求失敗')
      }

      // 清除本地會話
      clearSession()
      setUser(null)

      // 重定向到登入頁面
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }, [router])

  // 檢查是否是管理員
  const isAdmin = useCallback(() => {
    return user?.role === 'admin'
  }, [user])

  // 檢查是否已認證
  const isAuthenticated = Boolean(user)

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    logout
  }
} 
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

interface UseAuthReturn {
  user: UserSession | null
  isAuthenticated: boolean
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean }>
  logout: () => Promise<void>
  isAdmin: () => boolean
  updateUser: (userData: Partial<UserSession>) => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserSession | null>({ 
    id: '1', 
    email: 'admin@example.com', 
    name: 'Admin', 
    role: 'admin',
    nickname: 'Admin',
    phone: '',
    lineId: '',
    address: '',
    birthday: '',
    image: '',
    status: 'active'
  })
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    setLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async ({ email, password, step }: LoginCredentials) => {
    return { success: true }
  }

  const logout = async () => {
    router.push('/login')
  }

  const isAdmin = () => {
    return true
  }

  const updateUser = async (userData: Partial<UserSession>): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('更新失敗')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      return true
    } catch (error) {
      console.error('更新個人資料失敗:', error)
      return false
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    isAdmin,
    updateUser
  }
} 
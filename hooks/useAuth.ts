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
  const [user, setUser] = useState<UserSession | null>({ id: '1', email: 'admin@example.com', name: 'Admin', role: 'admin' })
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

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    isAdmin
  }
} 
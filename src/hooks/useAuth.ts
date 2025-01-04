import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Session } from 'next-auth'
import { PATHS } from '@/utils/paths'

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  status: string
}

interface AuthSession {
  user: User
  expires: string
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()

      if (data.session) {
        setSession(data.session)
        setStatus('authenticated')
      } else {
        setSession(null)
        setStatus('unauthenticated')
      }
    } catch (err) {
      setError('無法檢查登入狀態')
      setStatus('unauthenticated')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await checkSession()
        router.push(PATHS.home)
        return true
      } else {
        setError(data.message || '登入失敗')
        return false
      }
    } catch (err) {
      setError('登入失敗，請稍後再試')
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setSession(null)
      setStatus('unauthenticated')
      router.push(PATHS.login)
    } catch (err) {
      setError('登出失敗，請稍後再試')
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok && session) {
        setSession({
          ...session,
          user: { ...session.user, ...userData as User }
        })
        return true
      } else {
        setError(data.message || '更新失敗')
        return false
      }
    } catch (err) {
      setError('更新失敗，請稍後再試')
      return false
    }
  }

  return {
    session,
    status,
    error,
    login,
    logout,
    updateUser,
    user: session?.user
  }
} 
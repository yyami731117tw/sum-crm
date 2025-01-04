import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        switch (result.error) {
          case 'account_disabled':
            setError('您的帳號已被停用')
            break
          case 'account_pending':
            setError('您的帳號正在審核中')
            break
          default:
            setError(result.error)
        }
        return false
      }

      if (result?.ok) {
        router.push('/dashboard')
        return true
      }

      return false
    } catch (error) {
      setError('登入時發生錯誤')
      return false
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return {
    session,
    status,
    error,
    login,
    logout,
  }
} 
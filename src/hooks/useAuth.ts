import { useSession, signIn, signOut, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export interface User {
  id: string
  name?: string | null
  nickname?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
  lineId?: string | null
  address?: string | null
  birthday?: string | null
  role: string
  status: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResult {
  success: boolean
  error?: string
}

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  logout: () => Promise<void>
  isAdmin: () => boolean
  hasRole: (roles: string | string[]) => boolean
  checkUserStatus: () => boolean
  updateUser: (userData: Partial<User>) => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()

  // 檢查用戶狀態
  const checkUserStatus = () => {
    if (!session?.user) return false
    
    switch (session.user.status) {
      case 'active':
        return true
      case 'inactive':
        signOut({ redirect: false })
        router.push('/login?error=account_disabled')
        return false
      case 'pending':
        signOut({ redirect: false })
        router.push('/login?error=account_pending')
        return false
      default:
        return false
    }
  }

  // 自動檢查用戶狀態
  useEffect(() => {
    if (session?.user) {
      checkUserStatus()
    }
  }, [session])

  const login = async ({ email, password }: LoginCredentials): Promise<LoginResult> => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      if (result?.error) {
        return { success: false, error: result.error }
      }

      // 登入成功，重新獲取 session
      const session = await getSession()
      if (!session) {
        return { success: false, error: '登入失敗' }
      }

      // 檢查用戶狀態
      if (session.user.status === 'inactive') {
        await signOut({ redirect: false })
        return { success: false, error: 'account_disabled' }
      }

      if (session.user.status === 'pending') {
        await signOut({ redirect: false })
        return { success: false, error: 'account_pending' }
      }

      // 登入成功，重定向到首頁或回調 URL
      const callbackUrl = router.query.callbackUrl as string
      await router.push(callbackUrl || '/')
      return { success: true }
    } catch (error) {
      console.error('登入錯誤:', error)
      return { success: false, error: '登入時發生錯誤' }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const isAdmin = () => {
    return session?.user?.role === 'admin'
  }

  const hasRole = (roles: string | string[]) => {
    if (!session?.user?.role) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(session.user.role)
  }

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      return response.ok
    } catch (error) {
      console.error('更新用戶資料失敗:', error)
      return false
    }
  }

  return {
    user: session?.user as User | null,
    loading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    logout,
    isAdmin,
    hasRole,
    checkUserStatus,
    updateUser
  }
} 
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

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
  updateUser: (userData: Partial<User>) => Promise<boolean>
}

// 模擬的管理員用戶
const mockAdminUser: User = {
  id: '1',
  name: '系統管理員',
  email: 'admin@mbc.com',
  role: 'admin',
  status: 'active',
  phone: null,
  lineId: null,
  address: null,
  birthday: null,
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (session?.user) {
      setUser(session.user as User)
    } else {
      setUser(null)
    }
  }, [session])

  const login = async ({ email, password }: LoginCredentials) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      return {
        success: !result?.error,
        error: result?.error || undefined,
      }
    } catch (error) {
      return {
        success: false,
        error: '登入失敗',
      }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/profile', {
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
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser,
      }))

      return true
    } catch (error) {
      console.error('更新用戶資料失敗:', error)
      return false
    }
  }

  return {
    user,
    loading: status === 'loading',
    isAuthenticated: !!session,
    login,
    logout,
    isAdmin,
    updateUser
  }
} 
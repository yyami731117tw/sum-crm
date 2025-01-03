import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

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

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async ({ email, password }: LoginCredentials) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      })

      console.log('登入結果:', result)

      if (result?.error) {
        console.error('登入錯誤:', result.error)
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (error) {
      console.error('登入失敗:', error)
      return { success: false, error: '登入過程中發生錯誤' }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const isAdmin = () => {
    return session?.user?.role === 'admin'
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

      if (!response.ok) {
        throw new Error('更新失敗')
      }

      return true
    } catch (error) {
      console.error('更新個人資料失敗:', error)
      return false
    }
  }

  return {
    user: session?.user as User,
    loading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    logout,
    isAdmin,
    updateUser
  }
} 
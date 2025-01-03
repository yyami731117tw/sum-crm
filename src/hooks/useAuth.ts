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

  const login = async ({ email, password }: LoginCredentials) => {
    return { success: true }
  }

  const logout = async () => {
    router.push('/login')
  }

  const isAdmin = () => {
    return true
  }

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    return true
  }

  return {
    user: mockAdminUser,
    loading: false,
    isAuthenticated: true,
    login,
    logout,
    isAdmin,
    updateUser
  }
} 
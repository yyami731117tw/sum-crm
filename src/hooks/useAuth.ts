import { useSession, signIn, signOut } from 'next-auth/react'

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
  lineId?: string | null
  address?: string | null
  birthday?: string | null
  role: string
  status: string
}

// 模擬的管理員用戶
const mockUser: User = {
  id: '1',
  name: '管理員',
  email: 'admin@mbc.com',
  role: 'admin',
  status: 'active',
  phone: null,
  lineId: null,
  address: null,
  birthday: null,
  image: null,
}

export function useAuth() {
  // 暫時返回模擬的用戶資料
  return {
    user: mockUser,
    loading: false,
    isAuthenticated: true,
  }
} 
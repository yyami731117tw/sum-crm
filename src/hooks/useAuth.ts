import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'guest'
  status: 'pending' | 'active' | 'inactive'
}

// 模擬的管理員用戶
const mockAdminUser: User = {
  id: '1',
  name: '管理員',
  email: 'admin@example.com',
  role: 'admin',
  status: 'active'
}

export function useAuth() {
  // 暫時直接使用模擬的管理員用戶
  const [user, setUser] = useState<User | null>(mockAdminUser)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 暫時移除 useEffect 中的認證檢查
  useEffect(() => {
    setLoading(false)
  }, [])

  // 模擬的認證函數
  const login = async (email: string, password: string) => {
    setUser(mockAdminUser)
    return { user: mockAdminUser }
  }

  const logout = async () => {
    setUser(null)
    router.push('/login')
  }

  const signup = async (userData: {
    name: string
    email: string
    password: string
  }) => {
    return { message: '註冊成功' }
  }

  const checkAuth = async () => {
    return { user: mockAdminUser }
  }

  return {
    user,
    loading,
    login,
    logout,
    signup,
    checkAuth
  }
} 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface LoginCredentials {
  email: string
  password: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      // TODO: 實際的 API 調用
      const response = await mockLoginApi(credentials)
      
      if (response.success) {
        localStorage.setItem('token', response.token)
        document.cookie = `token=${response.token}; path=/`
        setIsAuthenticated(true)
        await router.push('/')
        return { success: true }
      }
      
      return { success: false, error: '登入失敗' }
    } catch (error) {
      console.error('登入錯誤:', error)
      return { success: false, error: '發生錯誤' }
    }
  }

  const logout = async () => {
    localStorage.removeItem('token')
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    setIsAuthenticated(false)
    await router.push('/login')
  }

  return { isAuthenticated, loading, login, logout }
}

// 模擬 API 調用
async function mockLoginApi(credentials: LoginCredentials) {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 模擬驗證
  if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
    return {
      success: true,
      token: 'mock-jwt-token'
    }
  }

  throw new Error('Invalid credentials')
} 
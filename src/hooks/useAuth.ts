import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Role, Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/utils/permissions'

interface User {
  id: string
  email: string
  name: string
  role: Role
}

interface LoginCredentials {
  email: string
  password: string
}

interface ApiResponse<T = any> {
  success: boolean
  error?: string
  message?: string
  data?: T
}

// 模擬的管理員用戶
const mockAdminUser: User = {
  id: '1',
  email: 'admin@mbc.com',
  name: '管理員',
  role: 'admin' as Role
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(mockAdminUser) // 預設為管理員
  const [loading, setLoading] = useState(false) // 預設為 false
  const router = useRouter()

  // 移除 useEffect，不再自動檢查認證狀態
  
  const checkAuth = async () => {
    // 直接返回成功
    return { success: true }
  }

  const login = async ({ email, password }: LoginCredentials) => {
    // 直接返回成功
    setUser(mockAdminUser)
    return { success: true }
  }

  const logout = async () => {
    // 清除用戶狀態並導向登入頁
    setUser(null)
    router.push('/login')
    return { success: true }
  }

  const isPublicRoute = (pathname: string) => {
    return ['/login', '/signup', '/verify', '/terms', '/privacy'].includes(pathname)
  }

  const isAuthenticated = () => {
    return !!user
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  // 權限檢查函數
  const checkPermission = (permission: Permission) => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }

  const checkAnyPermission = (permissions: Permission[]) => {
    if (!user) return false
    return hasAnyPermission(user.role, permissions)
  }

  const checkAllPermissions = (permissions: Permission[]) => {
    if (!user) return false
    return hasAllPermissions(user.role, permissions)
  }

  return {
    user,
    loading,
    login,
    logout,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkAuth,
    isAuthenticated,
    isAdmin
  }
} 
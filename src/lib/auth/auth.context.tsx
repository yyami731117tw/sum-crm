'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from './auth.service'
import { UserRole } from '../storage/schema'

// 定義認證上下文類型
interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  } | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => void
  isAdmin: () => boolean
}

// 創建認證上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 認證提供者組件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const auth = AuthService.getInstance()

  // 初始化認證狀態
  useEffect(() => {
    const session = auth.getCurrentSession()
    if (session) {
      setUser({
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role
      })
    }
    setIsLoading(false)
  }, [])

  // 登入處理
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const session = await auth.login(email, password, rememberMe)
      setUser({
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('登入失敗')
    }
  }

  // 登出處理
  const logout = () => {
    auth.logout()
    setUser(null)
  }

  // 檢查管理員權限
  const isAdmin = () => auth.isAdmin()

  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    login,
    logout,
    isAdmin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 認證 Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
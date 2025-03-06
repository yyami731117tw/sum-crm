import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth.context'
import { UserRole } from '../storage/schema'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // 如果正在加載，顯示載入中
  if (isLoading) {
    return <div>載入中...</div>
  }

  // 如果未認證，重定向到登入頁面
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 如果需要特定角色但用戶沒有該角色，重定向到首頁
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
} 
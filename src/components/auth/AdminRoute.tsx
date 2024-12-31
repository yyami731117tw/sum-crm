import { FC, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

interface AdminRouteProps {
  children: ReactNode
}

export const AdminRoute: FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin()) {
    router.push('/')
    return null
  }

  return <>{children}</>
} 
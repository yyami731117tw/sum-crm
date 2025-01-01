import { FC, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/utils/permissions'

interface WithPermissionProps {
  children: ReactNode
  permissions?: Permission | Permission[]
  requireAll?: boolean
  fallback?: ReactNode
}

export const WithPermission: FC<WithPermissionProps> = ({
  children,
  permissions = [],
  requireAll = false,
  fallback = null
}) => {
  const { user } = useAuth()
  const router = useRouter()

  if (!user || !user.role) {
    router.push('/login')
    return null
  }

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions]

  if (permissionArray.length === 0) {
    return <>{children}</>
  }

  const hasAccess = requireAll
    ? hasAllPermissions(user.role, permissionArray)
    : hasAnyPermission(user.role, permissionArray)

  if (!hasAccess) {
    return <>{fallback}</> || null
  }

  return <>{children}</>
}

// 創建一個 HOC 工廠函數
export function withPermission(permissions?: Permission | Permission[], requireAll = false) {
  return function <P extends object>(WrappedComponent: FC<P>) {
    return function WithPermissionWrapper(props: P) {
      return (
        <WithPermission permissions={permissions} requireAll={requireAll}>
          <WrappedComponent {...props} />
        </WithPermission>
      )
    }
  }
} 
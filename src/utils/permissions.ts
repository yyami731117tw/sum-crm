// 定義權限類型
export type Permission = 
  | 'view_members'
  | 'edit_members'
  | 'delete_members'
  | 'view_investments'
  | 'edit_investments'
  | 'delete_investments'
  | 'view_contracts'
  | 'edit_contracts'
  | 'delete_contracts'
  | 'manage_users'
  | 'view_reports'

// 定義角色類型
export type Role = 'admin' | 'manager' | 'user'

// 角色權限映射
export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'view_members',
    'edit_members',
    'delete_members',
    'view_investments',
    'edit_investments',
    'delete_investments',
    'view_contracts',
    'edit_contracts',
    'delete_contracts',
    'manage_users',
    'view_reports'
  ],
  manager: [
    'view_members',
    'edit_members',
    'view_investments',
    'edit_investments',
    'view_contracts',
    'edit_contracts',
    'view_reports'
  ],
  user: [
    'view_members',
    'view_investments',
    'view_contracts'
  ]
}

// 檢查用戶是否擁有特定權限
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return rolePermissions[userRole]?.includes(permission) || false
}

// 檢查用戶是否擁有任一權限
export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

// 檢查用戶是否擁有所有權限
export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

// 獲取角色的所有權限
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || []
} 
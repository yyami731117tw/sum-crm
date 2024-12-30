import { type FC } from 'react'
import type { User } from '@/types'

interface PermissionManagerProps {
  // 定義props類型
}

export const PermissionManager: FC<PermissionManagerProps> = () => {
  // 如果暫時不需要這些功能，可以註釋掉
  // const [_users, setUsers] = useState<User[]>([])
  
  // const _onUserRoleUpdate = (userId: string, role: string) => {
  //   // 實現更新邏輯
  // }

  return (
    <div>
      <h2>權限管理</h2>
      {/* 實現權限管理UI */}
    </div>
  )
} 
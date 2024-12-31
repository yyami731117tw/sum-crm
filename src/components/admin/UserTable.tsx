import { FC } from 'react'
import { format } from 'date-fns'
import { Switch } from '@/components/ui/Switch'

interface User {
  id: string
  name: string
  email: string
  phone: string
  birthday: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin: string
}

interface UserTableProps {
  users: User[]
  loading: boolean
  onStatusChange: (userId: string, status: 'active' | 'inactive') => void
}

export const UserTable: FC<UserTableProps> = ({ users, loading, onStatusChange }) => {
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              姓名
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              聯絡資訊
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              註冊日期
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              最後登入
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              狀態
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
                <div className="text-sm text-gray-500">{user.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(user.createdAt), 'yyyy/MM/dd')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(user.lastLogin), 'yyyy/MM/dd HH:mm')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Switch
                  checked={user.status === 'active'}
                  onChange={() => onStatusChange(
                    user.id,
                    user.status === 'active' ? 'inactive' : 'active'
                  )}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => {/* 實現查看詳情功能 */}}
                >
                  查看詳情
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 
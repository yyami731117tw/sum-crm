import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'staff' | 'guest'
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  lastLogin: string
  lineId?: string
  address?: string
  birthday?: string
}

interface UserLog {
  id: string
  userId: string
  action: string
  timestamp: string
  details: string
}

interface EditUserDialogProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, data: {
    name: string
    email: string
    password?: string
    role: User['role']
    status: User['status']
  }) => Promise<void>
}

const AdminUsersPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedUserLogs, setSelectedUserLogs] = useState<UserLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  // 模擬加載使用者數據
  useEffect(() => {
    // TODO: 替換為實際的 API 調用
    const mockUsers: User[] = [
      {
        id: '1',
        name: '王大明',
        email: 'wang@example.com',
        phone: '0912-345-678',
        role: 'admin',
        status: 'active',
        joinDate: '2023/01/01',
        lastLogin: '2024/01/10',
        lineId: 'wang_123',
        address: '台北市信義區信義路五段7號',
        birthday: '1990/01/01'
      },
      {
        id: '2',
        name: '李小華',
        email: 'lee@example.com',
        phone: '0923-456-789',
        role: 'staff',
        status: 'active',
        joinDate: '2023/03/15',
        lastLogin: '2024/01/09',
        lineId: 'lee_456',
        address: '台北市大安區敦化南路二段100號',
        birthday: '1992/05/15'
      }
    ]
    setUsers(mockUsers)
  }, [])

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleViewLogs = (user: User) => {
    // 模擬從API獲取使用者記錄
    const mockLogs: UserLog[] = [
      {
        id: '1',
        userId: user.id,
        action: '登入系統',
        timestamp: '2024/01/15 14:30:00',
        details: 'IP: 192.168.1.1'
      },
      {
        id: '2',
        userId: user.id,
        action: '更新個人資料',
        timestamp: '2024/01/14 11:20:00',
        details: '修改電話號碼'
      },
      {
        id: '3',
        userId: user.id,
        action: '瀏覽首頁',
        timestamp: '2024/01/14 10:15:00',
        details: '-'
      }
    ]
    setSelectedUserLogs(mockLogs)
    setIsLogModalOpen(true)
  }

  const handleUpdateUser = async (id: string, data: {
    name: string
    email: string
    password?: string
    role: User['role']
    status: User['status']
  }) => {
    // TODO: 實作更新使用者資料的 API 調用
    setUsers(users.map(u => u.id === id ? { ...u, ...data } : u))
    setIsEditModalOpen(false)
  }

  const getStatusBadgeColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: User['status']) => {
    switch (status) {
      case 'active':
        return '啟用'
      case 'inactive':
        return '停用'
      case 'pending':
        return '待審核'
      default:
        return status
    }
  }

  const getRoleText = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return '管理員'
      case 'staff':
        return '客服人員'
      case 'guest':
        return '訪客'
      default:
        return role
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )

  const EditUserDialog = ({ user, isOpen, onClose, onUpdate }: EditUserDialogProps) => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'staff',
      status: user?.status || 'active'
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        await onUpdate(user.id, formData)
        onClose()
      } catch (error) {
        console.error('更新使用者失敗:', error)
      }
    }

    return (
      <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                編輯使用者
              </h3>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">角色</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="admin">管理員</option>
                      <option value="staff">客服人員</option>
                      <option value="guest">訪客</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">狀態</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="active">啟用</option>
                      <option value="inactive">停用</option>
                      <option value="pending">待審核</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">名稱</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">電子郵件</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      新密碼（若不修改請留空）
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    儲存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <>
      <Head>
        <title>人員管理 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100 pt-16">
        <DashboardNav />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                人員管理
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                {/* 搜尋區 */}
                <div className="mb-6">
                  <div className="max-w-lg">
                    <label htmlFor="search" className="sr-only">搜尋使用者</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="search"
                        id="search"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="搜尋姓名、信箱或電話"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 使用者列表 */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          使用者資料
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          角色
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          狀態
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          加入時間
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">操作</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-lg font-medium text-blue-600">
                                    {user.name[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-sm text-gray-500">{user.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getRoleText(user.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              getStatusBadgeColor(user.status)
                              }`}>
                              {getStatusText(user.status)}
                              </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                編輯
                              </button>
                            <button
                              onClick={() => handleViewLogs(user)}
                              className="text-green-600 hover:text-green-900"
                            >
                              使用記錄
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 編輯使用者 Modal */}
      {isEditModalOpen && selectedUser && (
        <EditUserDialog
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}

      {/* 使用記錄 Modal */}
      {isLogModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  使用記錄
                </h3>
                <div className="space-y-4">
                  {selectedUserLogs.map(log => (
                    <div key={log.id} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-sm text-gray-500">{log.details}</p>
                        </div>
                        <p className="text-sm text-gray-500">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminUsersPage

export async function getServerSideProps() {
  return {
    props: {},
  }
} 
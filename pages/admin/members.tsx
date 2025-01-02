import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  joinDate: string
  lastLogin: string
  investmentCount: number
  totalInvestment: number
  notes: string
}

const MemberManagementPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && !['admin', 'staff'].includes(user.role)) {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  // 模擬加載會員數據
  useEffect(() => {
    // TODO: 替換為實際的 API 調用
    const mockMembers: Member[] = [
      {
        id: '1',
        name: '陳小明',
        email: 'chen@example.com',
        phone: '0912-345-678',
        status: 'active',
        joinDate: '2023/01/01',
        lastLogin: '2024/01/10',
        investmentCount: 3,
        totalInvestment: 1500000,
        notes: '對生技產業特別有興趣'
      },
      {
        id: '2',
        name: '林美玲',
        email: 'lin@example.com',
        phone: '0923-456-789',
        status: 'active',
        joinDate: '2023/03/15',
        lastLogin: '2024/01/09',
        investmentCount: 2,
        totalInvestment: 800000,
        notes: '偏好科技新創投資'
      }
    ]
    setMembers(mockMembers)
  }, [])

  const handleEditMember = (member: Member) => {
    setSelectedMember(member)
    setIsEditModalOpen(true)
  }

  const handleUpdateMember = async (updatedMember: Member) => {
    // TODO: 實作更新會員資料的 API 調用
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m))
    setIsEditModalOpen(false)
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user || !['admin', 'staff'].includes(user.role)) {
    return null
  }

  return (
    <>
      <Head>
        <title>會員管理 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <DashboardNav />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                會員管理
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                {/* 搜尋和篩選區 */}
                <div className="mb-6 flex justify-between items-center">
                  <div className="max-w-lg flex-1 mr-4">
                    <label htmlFor="search" className="sr-only">搜尋會員</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
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
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      setSelectedMember({
                        id: '',
                        name: '',
                        email: '',
                        phone: '',
                        status: 'active',
                        joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
                        lastLogin: '',
                        investmentCount: 0,
                        totalInvestment: 0,
                        notes: ''
                      })
                      setIsEditModalOpen(true)
                    }}
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    新增會員
                  </button>
                </div>

                {/* 會員列表 */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          會員資料
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          投資概況
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          狀態
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          加入時間
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">編輯</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-lg font-medium text-blue-600">
                                    {member.name[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                                <div className="text-sm text-gray-500">{member.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">投資次數：{member.investmentCount}</div>
                            <div className="text-sm text-gray-500">總投資額：NT$ {member.totalInvestment.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {member.status === 'active' ? '正常' : '停用'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              編輯
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

      {/* 編輯會員 Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {selectedMember.id ? '編輯會員資料' : '新增會員'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      姓名
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={selectedMember.name}
                      onChange={(e) => setSelectedMember({
                        ...selectedMember,
                        name: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      電子郵件
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={selectedMember.email}
                      onChange={(e) => setSelectedMember({
                        ...selectedMember,
                        email: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      電話
                    </label>
                    <input
                      type="tel"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={selectedMember.phone}
                      onChange={(e) => setSelectedMember({
                        ...selectedMember,
                        phone: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      狀態
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={selectedMember.status}
                      onChange={(e) => setSelectedMember({
                        ...selectedMember,
                        status: e.target.value as 'active' | 'inactive'
                      })}
                    >
                      <option value="active">正常</option>
                      <option value="inactive">停用</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      備註
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={selectedMember.notes}
                      onChange={(e) => setSelectedMember({
                        ...selectedMember,
                        notes: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleUpdateMember(selectedMember)}
                >
                  儲存
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MemberManagementPage 
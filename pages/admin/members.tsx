import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Member {
  id: string
  memberNo: string
  name: string
  phone: string
  gender: '男' | '女'
  nickname?: string
  serviceStaff?: string
  idNumber: string
  birthday: string
  joinDate: string
  status: 'active' | 'inactive'
  email?: string
  lineId?: string
  address?: string
  memberType: '一般會員' | 'VIP會員'
  joinCondition?: string
  occupation?: string
  notes?: string
}

interface MemberLog {
  id: string
  memberId: string
  action: string
  timestamp: string
  details: string
}

const MembersPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedMemberLogs, setSelectedMemberLogs] = useState<MemberLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateMode, setIsCreateMode] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // 模擬加載會員數據
  useEffect(() => {
    // TODO: 替換為實際的 API 調用
    const mockMembers: Member[] = [
      {
        id: '1',
        memberNo: 'M001',
        name: '王小明',
        phone: '0912-345-678',
        gender: '男',
        nickname: '小明',
        serviceStaff: '張專員',
        idNumber: 'A123456789',
        birthday: '1990/01/01',
        joinDate: '2024/01/01',
        status: 'active',
        email: 'ming@example.com',
        lineId: 'ming_123',
        address: '台北市信義區信義路五段7號',
        memberType: '一般會員',
        joinCondition: '官網註冊',
        occupation: '工程師',
        notes: '對投資很有興趣'
      }
    ]
    setMembers(mockMembers)
  }, [])

  const handleCreateMember = () => {
    setIsCreateMode(true)
    setSelectedMember({
      id: '',
      memberNo: `M${String(members.length + 1).padStart(3, '0')}`,
      name: '',
      phone: '',
      gender: '男',
      idNumber: '',
      birthday: '',
      joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      status: 'active',
      memberType: '一般會員'
    } as Member)
    setIsEditModalOpen(true)
  }

  const handleEditMember = (member: Member) => {
    setIsCreateMode(false)
    setSelectedMember(member)
    setIsEditModalOpen(true)
  }

  const handleViewLogs = (member: Member) => {
    // 模擬從API獲取會員記錄
    const mockLogs: MemberLog[] = [
      {
        id: '1',
        memberId: member.id,
        action: '更新個人資料',
        timestamp: '2024/01/15 14:30:00',
        details: '修改電話號碼'
      },
      {
        id: '2',
        memberId: member.id,
        action: '參加活動',
        timestamp: '2024/01/14 11:20:00',
        details: '參加投資說明會'
      }
    ]
    setSelectedMemberLogs(mockLogs)
    setIsLogModalOpen(true)
  }

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return
    
    if (isCreateMode) {
      // TODO: 實作新增會員的 API 調用
      const newMember = {
        ...selectedMember,
        id: String(Date.now())  // 暫時使用時間戳作為ID
      }
      setMembers([...members, newMember])
    } else {
      // TODO: 實作更新會員資料的 API 調用
      setMembers(members.map(m => m.id === selectedMember.id ? selectedMember : m))
    }
    setIsEditModalOpen(false)
  }

  const getStatusBadgeColor = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return '啟用'
      case 'inactive':
        return '停用'
      default:
        return status
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
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
                {/* 搜尋和新增區 */}
                <div className="mb-6 flex justify-between items-center">
                  <div className="max-w-lg flex-1 mr-4">
                    <label htmlFor="search" className="sr-only">搜尋會員</label>
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
                        placeholder="搜尋會員編號、姓名或電話"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateMember}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                          會員類型
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
                                <div className="text-sm font-medium text-gray-900">
                                  <Link
                                    href={`/admin/members/${member.id}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                                  >
                                    {member.name}
                                  </Link>
                                </div>
                                <div className="text-sm text-gray-500">會員編號：{member.memberNo}</div>
                                <div className="text-sm text-gray-500">{member.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.memberType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              getStatusBadgeColor(member.status)
                            }`}>
                              {getStatusText(member.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => handleViewLogs(member)}
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

      {/* 編輯/新增會員 Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateMember}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {isCreateMode ? '新增會員' : '編輯會員資料'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        會員編號
                      </label>
                      <input
                        type="text"
                        value={selectedMember.memberNo}
                        readOnly
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        姓名
                      </label>
                      <input
                        type="text"
                        value={selectedMember.name}
                        onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        電話
                      </label>
                      <input
                        type="tel"
                        value={selectedMember.phone}
                        onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        性別
                      </label>
                      <select
                        value={selectedMember.gender}
                        onChange={(e) => setSelectedMember({...selectedMember, gender: e.target.value as '男' | '女'})}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        會員類型
                      </label>
                      <select
                        value={selectedMember.memberType}
                        onChange={(e) => setSelectedMember({...selectedMember, memberType: e.target.value as '一般會員' | 'VIP會員'})}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="一般會員">一般會員</option>
                        <option value="VIP會員">VIP會員</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        身分證字號
                      </label>
                      <input
                        type="text"
                        value={selectedMember.idNumber}
                        onChange={(e) => setSelectedMember({...selectedMember, idNumber: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        生日
                      </label>
                      <input
                        type="date"
                        value={selectedMember.birthday.replace(/\//g, '-')}
                        onChange={(e) => setSelectedMember({...selectedMember, birthday: e.target.value.replace(/-/g, '/')})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        電子郵件
                      </label>
                      <input
                        type="email"
                        value={selectedMember.email || ''}
                        onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        LINE ID
                      </label>
                      <input
                        type="text"
                        value={selectedMember.lineId || ''}
                        onChange={(e) => setSelectedMember({...selectedMember, lineId: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        通訊地址
                      </label>
                      <input
                        type="text"
                        value={selectedMember.address || ''}
                        onChange={(e) => setSelectedMember({...selectedMember, address: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        職業
                      </label>
                      <input
                        type="text"
                        value={selectedMember.occupation || ''}
                        onChange={(e) => setSelectedMember({...selectedMember, occupation: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        入會條件
                      </label>
                      <input
                        type="text"
                        value={selectedMember.joinCondition || ''}
                        onChange={(e) => setSelectedMember({...selectedMember, joinCondition: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        備註
                      </label>
                      <textarea
                        value={selectedMember.notes || ''}
                        onChange={(e) => setSelectedMember({...selectedMember, notes: e.target.value})}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isCreateMode ? '新增' : '儲存'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
                  {selectedMemberLogs.map(log => (
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

export default MembersPage 
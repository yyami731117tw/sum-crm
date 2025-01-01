import { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../src/hooks/useAuth'
import { MemberEditModal } from '../../src/components/admin/MemberEditModal'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'inactive'
  joinDate: string
  lastActivity: string
}

const MembersPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | undefined>()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    // TODO: 替換為實際的 API 調用
    const mockMembers: Member[] = [
      {
        id: '1',
        name: '張三',
        email: 'zhang@example.com',
        phone: '0912-345-678',
        company: '創新科技有限公司',
        status: 'active',
        joinDate: '2023-01-15',
        lastActivity: '2024-01-20'
      },
      {
        id: '2',
        name: '李四',
        email: 'li@example.com',
        phone: '0923-456-789',
        company: '未來投資股份有限公司',
        status: 'inactive',
        joinDate: '2023-03-20',
        lastActivity: '2023-12-15'
      },
      // 可以添加更多模擬數據
    ]
    setMembers(mockMembers)
  }, [])

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingMember(undefined)
    setIsModalOpen(true)
  }

  const handleSave = async (memberData: Omit<Member, 'id' | 'joinDate' | 'lastActivity'>) => {
    try {
      if (editingMember) {
        // TODO: 實現更新會員 API
        const updatedMembers = members.map(m => 
          m.id === editingMember.id 
            ? { ...m, ...memberData }
            : m
        )
        setMembers(updatedMembers)
      } else {
        // TODO: 實現新增會員 API
        const newMember: Member = {
          id: String(Date.now()),
          ...memberData,
          joinDate: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0]
        }
        setMembers([...members, newMember])
      }
    } catch (error) {
      console.error('保存會員資料時發生錯誤:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">會員管理</h1>
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                新增會員
              </button>
            </div>
            
            {/* 搜索和篩選區 */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="搜尋會員姓名、信箱或公司..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">所有狀態</option>
                  <option value="active">活躍</option>
                  <option value="inactive">非活躍</option>
                </select>
              </div>
            </div>

            {/* 會員列表 */}
            <div className="mt-8 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            會員資料
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            聯絡方式
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            狀態
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            加入日期
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            最後活動
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
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {member.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {member.company}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{member.email}</div>
                              <div className="text-sm text-gray-500">{member.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                member.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {member.status === 'active' ? '活躍' : '非活躍'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.joinDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.lastActivity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEdit(member)}
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
            </div>
          </div>
        </div>
      </div>

      <MemberEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMember(undefined)
        }}
        member={editingMember}
        onSave={handleSave}
      />
    </>
  )
}

export default MembersPage 
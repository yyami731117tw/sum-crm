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
  age?: number
  joinDate: string
  status: 'active' | 'inactive' | 'pending'
  email?: string
  lineId?: string
  address?: string
  memberCategory: '一般會員' | 'VIP會員'
  joinCondition?: string
  occupation?: '家管' | '軍公教' | '製造業' | '服務業' | '農業' | '科技業' | '金融保險' | '商業貿易' | '公共事業'
  notes?: string
  emergencyContact?: string
  emergencyPhone?: string
  emergencyRelation?: string
  interests?: string[]
  referrer?: string
  dietaryHabits?: string
  tags?: string[]
  vipStartDate?: string
  vipEndDate?: string
  contractNo?: string
  contractDate?: string
  contractAmount?: number
  paymentMethod?: '信用卡' | '現金' | '銀行轉帳'
  bankAccount?: string
  invoiceInfo?: string
}

interface MemberLog {
  id: string
  memberId: string
  action: string
  timestamp: string
  details: string
  operator: string
  changes?: {
    field: string
    oldValue: string
    newValue: string
  }[]
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarMember, setSidebarMember] = useState<Member | null>(null)
  const [sidebarMemberLogs, setSidebarMemberLogs] = useState<MemberLog[]>([])
  const [sidebarWidth, setSidebarWidth] = useState(600)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    setSidebarWidth(window.innerWidth / 2)
  }, [])

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
        memberCategory: '一般會員',
        joinCondition: '官網註冊',
        occupation: '科技業',
        notes: '對投資很有興趣'
      }
    ]
    setMembers(mockMembers)
  }, [])

  const handleCreateMember = () => {
    const newMember: Member = {
      id: '',
      memberNo: `M${String(members.length + 1).padStart(3, '0')}`,
      name: '',
      phone: '',
      gender: '男',
      idNumber: '',
      birthday: '',
      joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      status: 'active',
      memberCategory: '一般會員'
    }
    setSidebarMember(newMember)
    setIsSidebarOpen(true)
  }

  const handleEditMember = (member: Member) => {
    setIsCreateMode(false)
    setSelectedMember(member)
    setIsEditModalOpen(true)
  }

  const handleViewMember = (member: Member) => {
    setSidebarMember(member)
    // 模擬從API獲取會員記錄
    const mockLogs: MemberLog[] = [
      {
        id: '1',
        memberId: member.id,
        action: '更新個人資料',
        timestamp: '2024/01/15 14:30:00',
        details: '修改電話號碼',
        operator: '系統管理員'
      },
      {
        id: '2',
        memberId: member.id,
        action: '參加活動',
        timestamp: '2024/01/14 11:20:00',
        details: '參加投資說明會',
        operator: '系統管理員'
      }
    ]
    setSidebarMemberLogs(mockLogs)
    setIsSidebarOpen(true)
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

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopResizing)
  }

  const stopResizing = () => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', stopResizing)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX
      if (newWidth > 400 && newWidth < window.innerWidth - 100) {
        setSidebarWidth(newWidth)
      }
    }
  }

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing])

  const handleSaveMember = () => {
    if (!sidebarMember || !user) return

    // 如果是新增會員
    if (!sidebarMember.id) {
      const newMember = {
        ...sidebarMember,
        id: String(Date.now())  // 暫時使用時間戳作為ID
      }
      setMembers([...members, newMember])
      
      // 新增操作記錄
      const newLog: MemberLog = {
        id: Date.now().toString(),
        memberId: newMember.id,
        action: '新增會員',
        timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
        operator: user.email || user.name || '系統管理員',
        details: '新增會員資料',
      }
      setSidebarMemberLogs([newLog])
      setIsSidebarOpen(false)
      return
    }

    // 比對變更項目
    const originalMember = members.find(m => m.id === sidebarMember.id)
    if (!originalMember) return
    
    const changes: { field: string; oldValue: string; newValue: string }[] = []
    const fieldNames = {
      memberCategory: '會員分類',
      status: '狀態',
      name: '姓名',
      phone: '電話',
      gender: '性別',
      nickname: '暱稱',
      serviceStaff: '服務專員',
      idNumber: '身分證字號',
      birthday: '生日',
      joinDate: '加入時間',
      email: '電子郵件',
      lineId: 'LINE ID',
      address: '通訊地址',
      joinCondition: '入會條件',
      occupation: '職業',
      notes: '備註'
    }
    
    Object.keys(fieldNames).forEach(field => {
      const oldValue = originalMember[field as keyof Member]
      const newValue = sidebarMember[field as keyof Member]
      if (oldValue !== newValue) {
        changes.push({
          field: fieldNames[field as keyof typeof fieldNames],
          oldValue: oldValue?.toString() || '-',
          newValue: newValue?.toString() || '-'
        })
      }
    })
    
    if (changes.length > 0) {
      // 新增變更記錄
      const newLog: MemberLog = {
        id: Date.now().toString(),
        memberId: sidebarMember.id,
        action: '更新會員資料',
        timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
        operator: user.email || user.name || '系統管理員',
        details: `修改了 ${changes.length} 個欄位`,
        changes
      }
      
      setSidebarMemberLogs([newLog, ...sidebarMemberLogs])
    }

    // 更新會員資料
    setMembers(members.map(m => m.id === sidebarMember.id ? sidebarMember : m))
    setIsSidebarOpen(false)
  }

  // 計算年齡
  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday.replace(/\//g, '-'))
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // 當生日變更時更新年齡
  const handleBirthdayChange = (birthday: string) => {
    const formattedBirthday = birthday.replace(/-/g, '/')
    const age = calculateAge(formattedBirthday)
    setSidebarMember({
      ...sidebarMember!,
      birthday: formattedBirthday,
      age
    })
  }

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
                                  <button
                                    onClick={() => handleViewMember(member)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                                  >
                                    {member.name}
                                  </button>
                                </div>
                                <div className="text-sm text-gray-500">會員編號：{member.memberNo}</div>
                                <div className="text-sm text-gray-500">{member.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.memberCategory}
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
                              onClick={() => handleViewMember(member)}
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
                          {log.changes && (
                            <div className="mt-2 space-y-1">
                              {log.changes.map((change, index) => (
                                <p key={index} className="text-sm text-gray-500">
                                  {change.field}: {change.oldValue} → {change.newValue}
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-1">操作人員：{log.operator}</p>
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

      {/* 側邊會員詳細資料 */}
      {isSidebarOpen && sidebarMember && (
        <div className="fixed inset-0 overflow-hidden z-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                 onClick={() => setIsSidebarOpen(false)}></div>
            <section className="absolute inset-y-0 right-0 max-w-full flex">
              <div 
                className="absolute inset-y-0 left-0 w-4 cursor-ew-resize bg-transparent hover:bg-blue-200 hover:bg-opacity-50 transition-colors"
                onMouseDown={startResizing}
              >
                <div className="absolute inset-y-0 left-1/2 w-1 bg-gray-300"></div>
              </div>
              <div className="relative flex" style={{ width: `${sidebarWidth}px` }}>
                <div className="flex-1 h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  {/* 標題列 */}
                  <div className="px-4 py-6 sm:px-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl font-medium text-blue-600">
                              {sidebarMember.name[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h2 className="text-lg font-medium text-gray-900">
                            {sidebarMember.name}
                            {sidebarMember.nickname && ` (${sidebarMember.nickname})`}
                          </h2>
                          <p className="text-sm text-gray-500">
                            會員編號：{sidebarMember.memberNo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Link
                          href={`/admin/members/${sidebarMember.id}`}
                          className="mr-4 text-sm text-blue-600 hover:text-blue-900"
                        >
                          開啟完整頁面
                        </Link>
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <span className="sr-only">關閉</span>
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 會員資料 */}
                  <div className="flex-1 px-4 py-6 sm:px-6 overflow-y-auto">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      {/* 基本資料 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">基本資料</h3>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">會員編號</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.memberNo}
                            disabled
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">會員分類</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.memberCategory}
                            onChange={(e) => setSidebarMember({...sidebarMember, memberCategory: e.target.value as '一般會員' | 'VIP會員'})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="一般會員">一般會員</option>
                            <option value="VIP會員">VIP會員</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">姓名</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.name}
                            onChange={(e) => setSidebarMember({...sidebarMember, name: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">暱稱</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.nickname || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, nickname: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">性別</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.gender}
                            onChange={(e) => setSidebarMember({...sidebarMember, gender: e.target.value as '男' | '女'})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="男">男</option>
                            <option value="女">女</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">身分證字號</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.idNumber}
                            onChange={(e) => setSidebarMember({...sidebarMember, idNumber: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">生日</dt>
                        <dd className="mt-1">
                          <input
                            type="date"
                            value={sidebarMember.birthday.replace(/\//g, '-')}
                            onChange={(e) => handleBirthdayChange(e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">年齡</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.age || ''}
                            disabled
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">職業</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.occupation || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, occupation: e.target.value as Member['occupation']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            <option value="家管">家管</option>
                            <option value="軍公教">軍公教</option>
                            <option value="製造業">製造業</option>
                            <option value="服務業">服務業</option>
                            <option value="農業">農業</option>
                            <option value="科技業">科技業</option>
                            <option value="金融保險">金融保險</option>
                            <option value="商業貿易">商業貿易</option>
                            <option value="公共事業">公共事業</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">飲食習慣</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.dietaryHabits || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, dietaryHabits: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="例：素食、不吃海鮮"
                          />
                        </dd>
                      </div>

                      {/* 聯絡資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">聯絡資訊</h3>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">電話</dt>
                        <dd className="mt-1">
                          <input
                            type="tel"
                            value={sidebarMember.phone}
                            onChange={(e) => setSidebarMember({...sidebarMember, phone: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">電子郵件</dt>
                        <dd className="mt-1">
                          <input
                            type="email"
                            value={sidebarMember.email || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, email: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">LINE ID</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.lineId || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, lineId: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">通訊地址</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.address || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, address: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>

                      {/* 緊急聯絡人 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">緊急聯絡人</h3>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">姓名</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.emergencyContact || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, emergencyContact: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">關係</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.emergencyRelation || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, emergencyRelation: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">電話</dt>
                        <dd className="mt-1">
                          <input
                            type="tel"
                            value={sidebarMember.emergencyPhone || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, emergencyPhone: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>

                      {/* 會員資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">會員資訊</h3>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">加入時間</dt>
                        <dd className="mt-1">
                          <input
                            type="date"
                            value={sidebarMember.joinDate.replace(/\//g, '-')}
                            onChange={(e) => setSidebarMember({...sidebarMember, joinDate: e.target.value.replace(/-/g, '/')})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">入會條件</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.joinCondition || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, joinCondition: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">介紹人</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.referrer || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, referrer: e.target.value})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            {members.map(member => (
                              <option key={member.id} value={member.id}>{member.name}</option>
                            ))}
                          </select>
                        </dd>
                      </div>

                      {/* VIP 會員資訊 */}
                      {sidebarMember.memberCategory === 'VIP會員' && (
                        <>
                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">VIP 會員資訊</h3>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">VIP 開始日期</dt>
                            <dd className="mt-1">
                              <input
                                type="date"
                                value={sidebarMember.vipStartDate?.replace(/\//g, '-') || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, vipStartDate: e.target.value.replace(/-/g, '/')})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">VIP 結束日期</dt>
                            <dd className="mt-1">
                              <input
                                type="date"
                                value={sidebarMember.vipEndDate?.replace(/\//g, '-') || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, vipEndDate: e.target.value.replace(/-/g, '/')})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">合約編號</dt>
                            <dd className="mt-1">
                              <input
                                type="text"
                                value={sidebarMember.contractNo || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, contractNo: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">合約日期</dt>
                            <dd className="mt-1">
                              <input
                                type="date"
                                value={sidebarMember.contractDate?.replace(/\//g, '-') || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, contractDate: e.target.value.replace(/-/g, '/')})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">合約金額</dt>
                            <dd className="mt-1">
                              <input
                                type="number"
                                value={sidebarMember.contractAmount || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, contractAmount: Number(e.target.value)})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">付款方式</dt>
                            <dd className="mt-1">
                              <select
                                value={sidebarMember.paymentMethod || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, paymentMethod: e.target.value as '信用卡' | '現金' | '銀行轉帳'})}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              >
                                <option value="">請選擇</option>
                                <option value="信用卡">信用卡</option>
                                <option value="現金">現金</option>
                                <option value="銀行轉帳">銀行轉帳</option>
                              </select>
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">銀行帳號</dt>
                            <dd className="mt-1">
                              <input
                                type="text"
                                value={sidebarMember.bankAccount || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, bankAccount: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">發票資訊</dt>
                            <dd className="mt-1">
                              <input
                                type="text"
                                value={sidebarMember.invoiceInfo || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, invoiceInfo: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </dd>
                          </div>
                        </>
                      )}

                      {/* 其他資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">其他資訊</h3>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">興趣</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.interests?.join(', ') || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, interests: e.target.value.split(',').map(s => s.trim())})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="請用逗號分隔多個興趣"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">標籤</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.tags?.join(', ') || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, tags: e.target.value.split(',').map(s => s.trim())})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="請用逗號分隔多個標籤"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">備註</dt>
                        <dd className="mt-1">
                          <textarea
                            value={sidebarMember.notes || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, notes: e.target.value})}
                            rows={3}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                    </dl>

                    {/* 使用記錄 */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">使用記錄</h3>
                      <div className="space-y-4">
                        {sidebarMemberLogs.map(log => (
                          <div key={log.id} className="border-b border-gray-200 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                <p className="text-sm text-gray-500">{log.details}</p>
                                {log.changes && (
                                  <div className="mt-2 space-y-1">
                                    {log.changes.map((change, index) => (
                                      <p key={index} className="text-sm text-gray-500">
                                        {change.field}: {change.oldValue} → {change.newValue}
                                      </p>
                                    ))}
                                  </div>
                                )}
                                <p className="text-sm text-gray-500 mt-1">操作人員：{log.operator}</p>
                              </div>
                              <p className="text-sm text-gray-500">{log.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 底部按鈕 */}
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end space-x-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleSaveMember}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      儲存
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  )
}

export default MembersPage 
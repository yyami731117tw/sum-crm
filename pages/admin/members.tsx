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
  memberCategory: '一般會員' | '天使' | 'VIP' | '合作' | '股東' | '黑名單'
  joinCondition?: '舊會員' | '會員體驗' | '200萬財力審查'
  nationality?: '台灣 Taiwan' | '馬來西亞 Malaysia' | '中國 China' | '香港 Hong Kong' | '澳洲 Australia' | '日本 Japan'
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
  passportName?: string
  passportNo?: string
  isUSCitizen?: boolean
  idCardFront?: string
  idCardBack?: string
  relatedMembers?: {
    memberId: string
    relationship: string
  }[]
  investments?: {
    id: string
    contractId: string
    projectName: string
    amount: number
    date: string
    status: '進行中' | '已結束' | '已取消'
  }[]
  hasMembershipPeriod?: boolean
  membershipStartDate?: string
  membershipEndDate?: string
  familyStatus?: string
  education?: '高中以下' | '高中職' | '專科' | '大學' | '碩士' | '博士'
  expertise?: string[]
  taboos?: string[]
  remainingDays?: number
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

interface User {
  id: string
  name: string
  email: string
  role: string
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
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    setSidebarWidth(window.innerWidth / 2)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // 從 localStorage 加載會員數據
  useEffect(() => {
    const savedMembers = localStorage.getItem('members')
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers))
      return
    }

    // 如果 localStorage 中沒有數據，則使用模擬數據
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
        joinCondition: '會員體驗',
        nationality: '台灣 Taiwan',
        occupation: '科技業',
        notes: '對投資很有興趣',
        relatedMembers: [],
        investments: []
      }
    ]
    setMembers(mockMembers)
    localStorage.setItem('members', JSON.stringify(mockMembers))
  }, [])

  // 當會員資料變更時，更新 localStorage
  useEffect(() => {
    if (members.length > 0) {
      localStorage.setItem('members', JSON.stringify(members))
    }
  }, [members])

  // 模擬加載使用者數據
  useEffect(() => {
    // TODO: 替換為實際的 API 調用
    const mockUsers: User[] = [
      {
        id: '1',
        name: '張專員',
        email: 'zhang@example.com',
        role: 'staff'
      },
      {
        id: '2',
        name: '李專員',
        email: 'li@example.com',
        role: 'staff'
      }
    ]
    setUsers(mockUsers)
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

    let updatedMembers: Member[]

    // 如果是新增會員
    if (!sidebarMember.id) {
      const newMember = {
        ...sidebarMember,
        id: String(Date.now())  // 使用時間戳作為ID
      }
      updatedMembers = [...members, newMember]
      setMembers(updatedMembers)
      
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
    } else {
      // 更新會員資料
      updatedMembers = members.map(m => m.id === sidebarMember.id ? sidebarMember : m)
      setMembers(updatedMembers)

      // 比對變更項目
      const originalMember = members.find(m => m.id === sidebarMember.id)
      if (originalMember) {
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
      }
    }

    // 儲存到 localStorage
    localStorage.setItem('members', JSON.stringify(updatedMembers))
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

  const handleFileUpload = async (file: File, type: 'front' | 'back') => {
    // TODO: 實作檔案上傳 API
    // 這裡先模擬上傳成功，返回檔案 URL
    const mockUrl = `https://example.com/uploads/${file.name}`
    setSidebarMember({
      ...sidebarMember!,
      [type === 'front' ? 'idCardFront' : 'idCardBack']: mockUrl
    })
  }

  // 計算剩餘天數
  const calculateRemainingDays = (endDate: string) => {
    const end = new Date(endDate.replace(/\//g, '-'))
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // 當會員期限變更時更新剩餘天數
  const handleMembershipEndDateChange = (endDate: string) => {
    const formattedEndDate = endDate.replace(/-/g, '/')
    const remainingDays = calculateRemainingDays(formattedEndDate)
    setSidebarMember({
      ...sidebarMember!,
      membershipEndDate: formattedEndDate,
      remainingDays
    })
  }

  // 修改會員期限警示邏輯
  const getMembershipStatusDisplay = (remainingDays: number) => {
    if (remainingDays <= 15) {
      return {
        color: 'text-orange-600',
        message: '確認會員是否續約'
      }
    } else if (remainingDays <= 30) {
      return {
        color: 'text-orange-600',
        message: '通知會員即將到期'
      }
    }
    return {
      color: 'text-gray-500',
      message: ''
    }
  }

  const getRemainingDaysColor = (remainingDays: number | undefined) => {
    if (!remainingDays) return 'text-gray-900'
    if (remainingDays <= 0) return 'text-red-600 font-bold'
    if (remainingDays <= 15) return 'text-red-600'
    if (remainingDays <= 30) return 'text-orange-500'
    return 'text-gray-900'
  }

  const getRemainingDaysMessage = (remainingDays: number | undefined) => {
    if (!remainingDays) return ''
    if (remainingDays <= 0) return '會員已到期!!'
    if (remainingDays <= 15) return '確認會員是否續約'
    if (remainingDays <= 30) return '通知會員即將到期'
    return ''
  }

  const getRemainingDaysDisplay = (remainingDays: number | undefined, hasMembershipPeriod: boolean | undefined) => {
    if (!hasMembershipPeriod) return '無期限'
    if (remainingDays === undefined) return ''
    if (remainingDays <= 0) return '已到期'
    return `${remainingDays} 天`
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          會員期限
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className={getRemainingDaysColor(member.remainingDays)}>
                                {getRemainingDaysDisplay(member.remainingDays, member.hasMembershipPeriod)}
                              </div>
                              {getRemainingDaysMessage(member.remainingDays) && (
                                <div className={`text-sm ${getRemainingDaysColor(member.remainingDays)}`}>
                                  {getRemainingDaysMessage(member.remainingDays)}
                                </div>
                              )}
                            </div>
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
                  <div className="px-4 py-4 sm:px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl font-medium text-blue-600">
                              {sidebarMember.name[0]}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {sidebarMember.name}
                            {sidebarMember.nickname && (
                              <span className="ml-2 text-base text-gray-500">
                                ({sidebarMember.nickname})
                              </span>
                            )}
                          </h2>
                          <div className="mt-1 flex items-center space-x-4">
                            <p className="text-sm text-gray-500">
                              會員編號：{sidebarMember.memberNo}
                            </p>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              getStatusBadgeColor(sidebarMember.status)
                            }`}>
                              {getStatusText(sidebarMember.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Link
                          href={`/admin/members/${sidebarMember.id}`}
                          className="text-sm text-blue-600 hover:text-blue-900 font-medium"
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
                  <div className="flex-1 px-4 py-6 sm:px-6 overflow-y-auto bg-gray-50">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                      {/* 基本資料 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">基本資料</h3>
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
                            onChange={(e) => setSidebarMember({...sidebarMember, memberCategory: e.target.value as Member['memberCategory']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="一般會員">一般會員</option>
                            <option value="天使">天使</option>
                            <option value="VIP">VIP</option>
                            <option value="合作">合作</option>
                            <option value="股東">股東</option>
                            <option value="黑名單">黑名單</option>
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
                        <dt className="text-sm font-medium text-gray-500">服務專員</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.serviceStaff || ''}
                            onChange={(e) => {
                              const selectedUser = users.find(user => user.id === e.target.value);
                              setSidebarMember({
                                ...sidebarMember,
                                serviceStaff: selectedUser ? selectedUser.name : ''
                              });
                            }}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                          </select>
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
                        <dt className="text-sm font-medium text-gray-500">國籍</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.nationality || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, nationality: e.target.value as Member['nationality']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            <option value="台灣 Taiwan">台灣 Taiwan</option>
                            <option value="馬來西亞 Malaysia">馬來西亞 Malaysia</option>
                            <option value="中國 China">中國 China</option>
                            <option value="香港 Hong Kong">香港 Hong Kong</option>
                            <option value="澳洲 Australia">澳洲 Australia</option>
                            <option value="日本 Japan">日本 Japan</option>
                          </select>
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
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">是否為美國公民</dt>
                        <dd className="mt-1">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isUSCitizen"
                              checked={sidebarMember.isUSCitizen || false}
                              onChange={(e) => setSidebarMember({...sidebarMember, isUSCitizen: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isUSCitizen" className="ml-2 block text-sm text-gray-900">
                              是
                            </label>
                          </div>
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">身分證影本</dt>
                        <dd className="mt-1 space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">正面</label>
                            <div className="mt-1 flex items-center space-x-4">
                              {sidebarMember.idCardFront ? (
                                <div className="relative">
                                  <img
                                    src={sidebarMember.idCardFront}
                                    alt="身分證正面"
                                    className="h-32 w-48 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setSidebarMember({...sidebarMember, idCardFront: undefined})}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center items-center w-48 h-32 border-2 border-gray-300 border-dashed rounded-lg">
                                  <label className="relative cursor-pointer">
                                    <div className="text-center">
                                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      <p className="mt-1 text-sm text-gray-600">點擊上傳</p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">反面</label>
                            <div className="mt-1 flex items-center space-x-4">
                              {sidebarMember.idCardBack ? (
                                <div className="relative">
                                  <img
                                    src={sidebarMember.idCardBack}
                                    alt="身分證反面"
                                    className="h-32 w-48 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setSidebarMember({...sidebarMember, idCardBack: undefined})}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center items-center w-48 h-32 border-2 border-gray-300 border-dashed rounded-lg">
                                  <label className="relative cursor-pointer">
                                    <div className="text-center">
                                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      <p className="mt-1 text-sm text-gray-600">點擊上傳</p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </dd>
                      </div>

                      {/* 聯絡資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">聯絡資訊</h3>
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
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">緊急聯絡人</h3>
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
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">會員資訊</h3>
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
                          <select
                            value={sidebarMember.joinCondition || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, joinCondition: e.target.value as Member['joinCondition']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            <option value="舊會員">舊會員</option>
                            <option value="會員體驗">會員體驗</option>
                            <option value="200萬財力審查">200萬財力審查</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">會員期限</dt>
                        <dd className="mt-1">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={sidebarMember.hasMembershipPeriod || false}
                                onChange={(e) => setSidebarMember({...sidebarMember, hasMembershipPeriod: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-sm text-gray-700">設定會員期限</label>
                            </div>
                            {sidebarMember.hasMembershipPeriod && (
                              <>
                                <input
                                  type="date"
                                  value={sidebarMember.membershipStartDate?.replace(/\//g, '-') || ''}
                                  onChange={(e) => setSidebarMember({...sidebarMember, membershipStartDate: e.target.value.replace(/-/g, '/')})}
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="開始日期"
                                />
                                <input
                                  type="date"
                                  value={sidebarMember.membershipEndDate?.replace(/\//g, '-') || ''}
                                  onChange={(e) => handleMembershipEndDateChange(e.target.value)}
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="結束日期"
                                />
                                {sidebarMember.remainingDays !== undefined && (
                                  <div className={`text-sm ${getRemainingDaysColor(sidebarMember.remainingDays)}`}>
                                    剩餘 {sidebarMember.remainingDays} 天
                                    {getRemainingDaysMessage(sidebarMember.remainingDays) && (
                                      <span className="ml-2">
                                        ({getRemainingDaysMessage(sidebarMember.remainingDays)})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
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
                              <option key={member.id} value={member.id}>{member.name} ({member.memberNo})</option>
                            ))}
                          </select>
                        </dd>
                      </div>

                      {/* VIP 會員資訊 */}
                      {(sidebarMember.memberCategory === 'VIP' || sidebarMember.memberCategory === '天使') && (
                        <>
                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">VIP 會員資訊</h3>
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
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">護照姓名</dt>
                            <dd className="mt-1">
                              <input
                                type="text"
                                value={sidebarMember.passportName || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, passportName: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">護照號碼</dt>
                            <dd className="mt-1">
                              <input
                                type="text"
                                value={sidebarMember.passportNo || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, passportNo: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </dd>
                          </div>
                        </>
                      )}

                      {/* 其他資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">其他資訊</h3>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">家庭狀況</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.familyStatus || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, familyStatus: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="例：已婚、育有2子"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">學歷</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.education || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, education: e.target.value as Member['education']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            <option value="高中以下">高中以下</option>
                            <option value="高中職">高中職</option>
                            <option value="專科">專科</option>
                            <option value="大學">大學</option>
                            <option value="碩士">碩士</option>
                            <option value="博士">博士</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">專長</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.expertise?.join(', ') || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, expertise: e.target.value.split(',').map(s => s.trim())})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="請用逗號分隔多個專長"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">禁忌</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.taboos?.join(', ') || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, taboos: e.target.value.split(',').map(s => s.trim())})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="請用逗號分隔多個禁忌"
                          />
                        </dd>
                      </div>

                      {/* 關係人資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">關係人資訊</h3>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">關係人</dt>
                        <dd className="mt-1">
                          <div className="space-y-2">
                            {sidebarMember.relatedMembers?.map((related, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <select
                                  value={related.memberId}
                                  onChange={(e) => {
                                    const newRelatedMembers = [...(sidebarMember.relatedMembers || [])]
                                    newRelatedMembers[index].memberId = e.target.value
                                    setSidebarMember({...sidebarMember, relatedMembers: newRelatedMembers})
                                  }}
                                  className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                  <option value="">請選擇會員</option>
                                  {members.filter(m => m.id !== sidebarMember.id).map(member => (
                                    <option key={member.id} value={member.id}>{member.name} ({member.memberNo})</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={related.relationship}
                                  onChange={(e) => {
                                    const newRelatedMembers = [...(sidebarMember.relatedMembers || [])]
                                    newRelatedMembers[index].relationship = e.target.value
                                    setSidebarMember({...sidebarMember, relatedMembers: newRelatedMembers})
                                  }}
                                  placeholder="關係"
                                  className="block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newRelatedMembers = [...(sidebarMember.relatedMembers || [])]
                                    newRelatedMembers.splice(index, 1)
                                    setSidebarMember({...sidebarMember, relatedMembers: newRelatedMembers})
                                  }}
                                  className="p-2 text-red-600 hover:text-red-900"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newRelatedMembers = [...(sidebarMember.relatedMembers || []), { memberId: '', relationship: '' }]
                                setSidebarMember({...sidebarMember, relatedMembers: newRelatedMembers})
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              新增關係人
                            </button>
                          </div>
                        </dd>
                      </div>

                      {/* 投資履歷 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">投資履歷</h3>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  投資項目
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  金額
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  日期
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  狀態
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                  <span className="sr-only">操作</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sidebarMember.investments?.map((investment) => (
                                <tr key={investment.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {investment.projectName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${investment.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {investment.date}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      investment.status === '進行中' ? 'bg-green-100 text-green-800' :
                                      investment.status === '已結束' ? 'bg-gray-100 text-gray-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {investment.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                      href={`/admin/contracts/${investment.contractId}`}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      查看合約
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {(!sidebarMember.investments || sidebarMember.investments.length === 0) && (
                            <div className="text-center py-4 text-sm text-gray-500">
                              尚無投資紀錄
                            </div>
                          )}
                        </div>
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
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end space-x-3 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                    <button
                      type="button"
                      onClick={handleSaveMember}
                      className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      儲存
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(false)}
                      className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
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
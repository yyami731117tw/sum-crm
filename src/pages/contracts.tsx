import type { NextPage } from 'next'
import type { ReactElement } from 'react'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { MainNav } from '@/components/layout/MainNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Attachment {
  id: string
  name: string
  url: string
  uploadDate: string
}

interface Contract {
  id: string
  contractNo: string
  projectName: string
  memberId: string
  memberName: string
  memberNo: string
  amount: number
  paymentMethod?: '現金' | '信用卡' | '銀行轉帳'
  bankAccount?: string
  signDate: string
  startDate: string
  endDate: string
  status: '進行中' | '已結束' | '已取消'
  invoiceInfo?: string
  notes?: string
  contractFile?: string
  attachments?: Attachment[]
}

interface ContractLog {
  id: string
  contractId: string
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

const ContractsPage = (): ReactElement => {
  const { session, status } = useAuth()
  const loading = status === 'loading'
  const user = session?.user
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedContractLogs, setSelectedContractLogs] = useState<ContractLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarContract, setSidebarContract] = useState<Contract | null>(null)
  const [sidebarContractLogs, setSidebarContractLogs] = useState<ContractLog[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [memberSearchTerm, setMemberSearchTerm] = useState('')
  const [showMemberSearch, setShowMemberSearch] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    // 從 API 載入合約資料
    const loadContracts = async () => {
      try {
        const response = await fetch('/api/contracts', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error('讀取合約資料失敗')
        }
        const data = await response.json()
        setContracts(data)
      } catch (error) {
        console.error('讀取合約資料失敗:', error)
      }
    }

    loadContracts()
  }, [loading, user, router])

  useEffect(() => {
    // 載入會員資料
    const loadMembers = async () => {
      try {
        const response = await fetch('/api/members')
        if (!response.ok) throw new Error('載入會員資料失敗')
        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error('載入會員資料失敗:', error)
      }
    }
    loadMembers()
  }, [])

  const handleViewContract = (contract: Contract) => {
    setSidebarContract(contract)
    setIsSidebarOpen(true)
    loadContractLogs(contract.id)
  }

  const loadContractLogs = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/logs`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('讀取合約記錄失敗')
      }
      const data = await response.json()
      setSidebarContractLogs(data)
    } catch (error) {
      console.error('讀取合約記錄失敗:', error)
      setSidebarContractLogs([])
    }
  }

  const generateContractNo = () => {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 7)
    return `${timestamp}${randomStr}`.toUpperCase()
  }

  const handleCreateContract = () => {
    const newContract: Contract = {
      id: generateId(),
      contractNo: generateContractNo(),
      projectName: '',
      memberId: '',
      memberName: '',
      memberNo: '',
      amount: 0,
      signDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      startDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      endDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      status: '進行中'
    }
    setSidebarContract(newContract)
    setIsSidebarOpen(true)
  }

  const handleSaveContract = async () => {
    if (!sidebarContract) return

    // 檢查必填欄位
    if (!sidebarContract.projectName || !sidebarContract.memberId || !sidebarContract.amount) {
      alert('請填寫必填欄位：專案名稱、會員、金額')
      return
    }

    const now = new Date()
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    try {
      // 如果是新合約
      if (!sidebarContract.id) {
        // 建立新合約
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sidebarContract),
        })

        if (!response.ok) {
          throw new Error('建立合約失敗')
        }

        const newContract = await response.json()

        // 更新會員的投資紀錄
        const memberResponse = await fetch(`/api/members/${sidebarContract.memberId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            investments: {
              create: {
                contractId: newContract.id,
                projectName: sidebarContract.projectName,
                amount: sidebarContract.amount,
                date: sidebarContract.signDate,
                status: sidebarContract.status,
              },
            },
          }),
        })

        if (!memberResponse.ok) {
          throw new Error('更新會員投資紀錄失敗')
        }

        setContracts(prevContracts => [...prevContracts, newContract])

        // 記錄新增合約的變更
        const newLog: ContractLog = {
          id: generateId(),
          contractId: newContract.id,
          action: '新增合約',
          timestamp,
          details: `新增合約：${newContract.projectName}（${newContract.contractNo}）`,
          operator: user?.name || '系統管理員'
        }
        
        // 更新 localStorage 中的變更紀錄
        const savedLogs = localStorage.getItem('contractLogs')
        const allLogs: ContractLog[] = savedLogs ? JSON.parse(savedLogs) : []
        const updatedLogs = [newLog, ...allLogs]
        localStorage.setItem('contractLogs', JSON.stringify(updatedLogs))
        setSidebarContractLogs(prevLogs => [newLog, ...prevLogs])
      } else {
        // 如果是編輯現有合約
        const oldContract = contracts.find(c => c.id === sidebarContract.id)
        if (oldContract) {
          // 比較變更的欄位
          const changes: { field: string; oldValue: string; newValue: string }[] = []
          Object.entries(sidebarContract).forEach(([key, value]) => {
            const oldValue = oldContract[key as keyof Contract]
            if (oldValue !== value) {
              changes.push({
                field: key,
                oldValue: String(oldValue || ''),
                newValue: String(value || '')
              })
            }
          })

          if (changes.length > 0) {
            // 更新合約
            const response = await fetch(`/api/contracts/${sidebarContract.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(sidebarContract),
            })

            if (!response.ok) {
              throw new Error('更新合約失敗')
            }

            const updatedContract = await response.json()

            // 如果金額或狀態有變更，更新會員的投資紀錄
            if (oldContract.amount !== sidebarContract.amount || oldContract.status !== sidebarContract.status) {
              const memberResponse = await fetch(`/api/members/${sidebarContract.memberId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  investments: {
                    update: {
                      where: {
                        contractId: sidebarContract.id,
                      },
                      data: {
                        amount: sidebarContract.amount,
                        status: sidebarContract.status,
                      },
                    },
                  },
                }),
              })

              if (!memberResponse.ok) {
                throw new Error('更新會員投資紀錄失敗')
              }
            }

            setContracts(prevContracts => prevContracts.map(contract =>
              contract.id === sidebarContract.id ? updatedContract : contract
            ))

            const newLog: ContractLog = {
              id: generateId(),
              contractId: sidebarContract.id,
              action: '更新合約資料',
              timestamp,
              details: `更新合約：${sidebarContract.projectName}（${sidebarContract.contractNo}）的資料`,
              operator: user?.name || '系統管理員',
              changes
            }
            
            // 更新 localStorage 中的變更紀錄
            const savedLogs = localStorage.getItem('contractLogs')
            const allLogs: ContractLog[] = savedLogs ? JSON.parse(savedLogs) : []
            const updatedLogs = [newLog, ...allLogs]
            localStorage.setItem('contractLogs', JSON.stringify(updatedLogs))
            setSidebarContractLogs(prevLogs => [newLog, ...prevLogs])
          }
        }
      }

      setIsSidebarOpen(false)
      setSidebarContract(null)
    } catch (error) {
      console.error('儲存合約失敗:', error)
      alert('儲存合約失敗，請稍後再試')
    }
  }

  // 生成唯一 ID
  const generateId = () => {
    return 'id_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const getStatusBadgeColor = (status: Contract['status']) => {
    switch (status) {
      case '進行中':
        return 'bg-green-100 text-green-800'
      case '已結束':
        return 'bg-gray-100 text-gray-800'
      case '已取消':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContracts = contracts.filter(contract =>
    contract.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contractNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.memberNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFileUpload = async (file: File, type: 'contract' | 'attachment') => {
    try {
      // TODO: 實作檔案上傳 API
      // 這裡先模擬上傳成功，返回檔案 URL
      const mockUrl = `https://example.com/uploads/${file.name}`
      
      if (type === 'contract') {
        setSidebarContract({
          ...sidebarContract!,
          contractFile: file.name
        })
      } else {
        const newAttachment = {
          id: generateId(),
          name: file.name,
          url: mockUrl,
          uploadDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
        }
        setSidebarContract({
          ...sidebarContract!,
          attachments: [...(sidebarContract?.attachments || []), newAttachment]
        })
      }
    } catch (error) {
      console.error('檔案上傳失敗:', error)
      alert('檔案上傳失敗，請稍後再試')
    }
  }

  const handleDownloadFile = (attachment: Attachment) => {
    // TODO: 實作檔案下載功能
    window.open(attachment.url, '_blank')
  }

  const handleRemoveAttachment = (index: number) => {
    if (!sidebarContract) return
    const newAttachments = [...(sidebarContract.attachments || [])]
    newAttachments.splice(index, 1)
    setSidebarContract({
      ...sidebarContract,
      attachments: newAttachments
    })
  }

  const handleSelectMember = (member: any) => {
    setSidebarContract({
      ...sidebarContract!,
      memberId: member.id,
      memberName: member.name,
      memberNo: member.memberNo
    })
    setShowMemberSearch(false)
    setMemberSearchTerm('')
  }

  const filteredMembers = members.filter(member => {
    const isValidMember = member.status !== '一般會員' && member.status !== '黑名單'
    const matchesSearch = member.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      member.memberNo.toLowerCase().includes(memberSearchTerm.toLowerCase())
    return isValidMember && matchesSearch
  })

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
        <title>合約管理 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100 pt-16">
        <MainNav />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                合約管理
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                {/* 搜尋和新增區 */}
                <div className="mb-6 flex justify-between items-center">
                  <div className="max-w-lg flex-1 mr-4">
                    <label htmlFor="search" className="sr-only">搜尋合約</label>
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
                        placeholder="搜尋合約編號、專案名稱、會員姓名或編號"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateContract}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    新增合約
                  </button>
                </div>

                {/* 合約列表 */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          合約資料
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          會員資料
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          金額
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          狀態
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          簽約日期
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">操作</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContracts.map((contract) => (
                        <tr key={contract.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {contract.projectName}
                            </div>
                            <div className="text-sm text-gray-500">
                              合約編號：{contract.contractNo}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {contract.memberName}
                            </div>
                            <div className="text-sm text-gray-500">
                              會員編號：{contract.memberNo}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${contract.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              getStatusBadgeColor(contract.status)
                            }`}>
                              {contract.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contract.signDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewContract(contract)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              查看
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!contracts || contracts.length === 0) && (
                    <div className="text-center py-8 text-sm text-gray-500">
                      尚無合約資料
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* 側邊合約詳細資料 */}
        {isSidebarOpen && sidebarContract && (
          <div className="fixed inset-0 overflow-hidden z-20">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                   onClick={() => setIsSidebarOpen(false)}></div>
              <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
                <div className="w-screen max-w-2xl">
                  <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                    {/* 標題列 */}
                    <div className="px-4 py-6 sm:px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">
                            合約詳細資料
                          </h2>
                        </div>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                          >
                            <span className="sr-only">關閉面板</span>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 合約資料表單 */}
                    <div className="flex-1 px-4 py-6 sm:px-6 overflow-y-auto bg-gray-50">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        {/* 基本資料 */}
                        <div className="sm:col-span-2">
                          <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">基本資料</h3>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">合約編號</dt>
                          <dd className="mt-1">
                            <input
                              type="text"
                              value={sidebarContract.contractNo}
                              readOnly
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">專案名稱 <span className="text-red-500">*</span></dt>
                          <dd className="mt-1">
                            <input
                              type="text"
                              value={sidebarContract.projectName}
                              onChange={(e) => setSidebarContract({...sidebarContract, projectName: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="請輸入專案名稱"
                            />
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">會員資料 <span className="text-red-500">*</span></dt>
                          <dd className="mt-1">
                            <div className="relative">
                              <div className="flex space-x-4">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={sidebarContract.memberName}
                                    readOnly
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="會員姓名"
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={sidebarContract.memberNo}
                                    readOnly
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="會員編號"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowMemberSearch(true)}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  選擇會員
                                </button>
                              </div>

                              {/* 會員搜尋下拉選單 */}
                              {showMemberSearch && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                  <div className="sticky top-0 z-10 bg-white">
                                    <input
                                      type="text"
                                      className="block w-full border-0 border-b border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 sm:text-sm"
                                      placeholder="搜尋會員..."
                                      value={memberSearchTerm}
                                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                                    />
                                  </div>
                                  <div className="max-h-48 overflow-y-auto">
                                    {filteredMembers.map((member) => (
                                      <div
                                        key={member.id}
                                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
                                        onClick={() => handleSelectMember(member)}
                                      >
                                        <div className="flex items-center">
                                          <span className="font-normal block truncate">
                                            {member.name} ({member.memberNo})
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                    {filteredMembers.length === 0 && (
                                      <div className="text-center py-2 text-sm text-gray-500">
                                        找不到符合的會員或無可投資會員
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">金額 <span className="text-red-500">*</span></dt>
                          <dd className="mt-1">
                            <input
                              type="number"
                              value={sidebarContract.amount}
                              onChange={(e) => setSidebarContract({...sidebarContract, amount: Number(e.target.value)})}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="請輸入金額"
                            />
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">付款方式</dt>
                          <dd className="mt-1">
                            <select
                              value={sidebarContract.paymentMethod}
                              onChange={(e) => setSidebarContract({...sidebarContract, paymentMethod: e.target.value as Contract['paymentMethod']})}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="現金">現金</option>
                              <option value="信用卡">信用卡</option>
                              <option value="銀行轉帳">銀行轉帳</option>
                            </select>
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">銀行帳戶資訊</dt>
                          <dd className="mt-1">
                            <input
                              type="text"
                              value={sidebarContract.bankAccount || ''}
                              onChange={(e) => setSidebarContract({...sidebarContract, bankAccount: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="請輸入銀行帳戶資訊"
                            />
                          </dd>
                        </div>

                        {/* 合約期間 */}
                        <div className="sm:col-span-2">
                          <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">合約期間</h3>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">簽約日期</dt>
                          <dd className="mt-1">
                            <input
                              type="date"
                              value={sidebarContract.signDate.replace(/\//g, '-')}
                              onChange={(e) => setSidebarContract({...sidebarContract, signDate: e.target.value.replace(/-/g, '/')})}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">狀態</dt>
                          <dd className="mt-1">
                            <select
                              value={sidebarContract.status}
                              onChange={(e) => setSidebarContract({...sidebarContract, status: e.target.value as Contract['status']})}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="進行中">進行中</option>
                              <option value="已結束">已結束</option>
                              <option value="已取消">已取消</option>
                            </select>
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">開始日期</dt>
                          <dd className="mt-1">
                            <input
                              type="date"
                              value={sidebarContract.startDate.replace(/\//g, '-')}
                              onChange={(e) => setSidebarContract({...sidebarContract, startDate: e.target.value.replace(/-/g, '/')})}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">結束日期</dt>
                          <dd className="mt-1">
                            <input
                              type="date"
                              value={sidebarContract.endDate.replace(/\//g, '-')}
                              onChange={(e) => setSidebarContract({...sidebarContract, endDate: e.target.value.replace(/-/g, '/')})}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </dd>
                        </div>

                        {/* 檔案上傳 */}
                        <div className="sm:col-span-2">
                          <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">檔案上傳</h3>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">合約掃描檔</dt>
                          <dd className="mt-1">
                            <div className="flex items-center space-x-4">
                              {sidebarContract.contractFile ? (
                                <div className="relative">
                                  <div className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-500">{sidebarContract.contractFile}</span>
                                    <button
                                      type="button"
                                      onClick={() => setSidebarContract({...sidebarContract, contractFile: undefined})}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center items-center w-full">
                                  <label className="relative cursor-pointer w-full">
                                    <div className="flex justify-center items-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none hover:border-gray-400 focus:outline-none">
                                      <div className="flex flex-col items-center space-y-2">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="font-medium text-gray-600">
                                          點擊上傳或拖放檔案至此
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          支援 PDF、JPG、PNG 格式
                                        </span>
                                      </div>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          handleFileUpload(file, 'contract')
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">其他文件</dt>
                          <dd className="mt-1">
                            <div className="space-y-4">
                              {sidebarContract.attachments?.map((attachment, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border border-gray-300 rounded-md">
                                  <div className="flex items-center space-x-2">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-500">{attachment.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadFile(attachment)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAttachment(index)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-center items-center w-full">
                                <label className="relative cursor-pointer w-full">
                                  <div className="flex justify-center items-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none hover:border-gray-400 focus:outline-none">
                                    <div className="flex flex-col items-center space-y-2">
                                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                      </svg>
                                      <span className="font-medium text-gray-600">
                                        點擊上傳或拖放檔案至此
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        支援各種文件格式
                                      </span>
                                    </div>
                                  </div>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        handleFileUpload(file, 'attachment')
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </dd>
                        </div>

                        {/* 其他資訊 */}
                        <div className="sm:col-span-2">
                          <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">其他資訊</h3>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">發票資訊</dt>
                          <dd className="mt-1">
                            <input
                              type="text"
                              value={sidebarContract.invoiceInfo || ''}
                              onChange={(e) => setSidebarContract({...sidebarContract, invoiceInfo: e.target.value})}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="請輸入發票資訊"
                            />
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">備註</dt>
                          <dd className="mt-1">
                            <textarea
                              value={sidebarContract.notes || ''}
                              onChange={(e) => setSidebarContract({...sidebarContract, notes: e.target.value})}
                              rows={4}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="請輸入備註"
                            />
                          </dd>
                        </div>

                        {/* 變更紀錄 */}
                        <div className="sm:col-span-2">
                          <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">變更紀錄</h3>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="max-h-40 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">時間</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">操作</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">內容</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">操作人</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {sidebarContractLogs.map(log => (
                                  <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                      {log.timestamp}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {log.action}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-500">
                                      <div>{log.details}</div>
                                      {log.changes && (
                                        <div className="text-xs text-gray-400">
                                          {log.changes.map((change, index) => (
                                            <div key={index}>
                                              {change.field}: {change.oldValue} → {change.newValue}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                      {log.operator}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {sidebarContractLogs.length === 0 && (
                              <div className="text-center py-3 text-sm text-gray-500">
                                尚無變更紀錄
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 按鈕區 */}
                        <div className="sm:col-span-2 mt-6 flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={handleSaveContract}
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
                      </dl>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ContractsPage as NextPage 
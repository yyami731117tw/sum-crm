import type { NextPage } from 'next'
import type { ReactElement } from 'react'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Contract {
  id: string
  contractNo: string
  projectName: string
  memberId: string
  memberName: string
  memberNo: string
  amount: number
  signDate: string
  startDate: string
  endDate: string
  status: '進行中' | '已結束' | '已取消'
  paymentMethod: '信用卡' | '現金' | '銀行轉帳'
  bankAccount?: string
  invoiceInfo?: string
  notes?: string
  createdAt: string
  updatedAt: string
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
  const { user, loading } = useAuth()
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
    const year = new Date().getFullYear().toString().slice(-2)
    const existingContracts = contracts.filter(c => c.contractNo.startsWith(year))
    const maxSeq = existingContracts.length > 0
      ? Math.max(...existingContracts.map(c => parseInt(c.contractNo.slice(-4))))
      : 0
    const nextSeq = (maxSeq + 1).toString().padStart(4, '0')
    return `${year}${nextSeq}`
  }

  const handleCreateContract = () => {
    const newContract: Contract = {
      id: '',
      contractNo: generateContractNo(),
      projectName: '',
      memberId: '',
      memberName: '',
      memberNo: '',
      amount: 0,
      signDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      startDate: '',
      endDate: '',
      status: '進行中',
      paymentMethod: '現金',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setSidebarContract(newContract)
    setSidebarContractLogs([])
    setIsSidebarOpen(true)
  }

  const handleSaveContract = () => {
    if (!sidebarContract) return

    // 檢查必填欄位
    if (!sidebarContract.projectName || !sidebarContract.memberId || !sidebarContract.amount) {
      alert('請填寫必填欄位：專案名稱、會員、金額')
      return
    }

    const now = new Date()
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    // 從 localStorage 讀取現有的變更紀錄
    const savedLogs = localStorage.getItem('contractLogs')
    const allLogs: ContractLog[] = savedLogs ? JSON.parse(savedLogs) : []

    // 如果是新合約
    if (!sidebarContract.id) {
      const newContract = {
        ...sidebarContract,
        id: generateId(),
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
          const updatedLogs = [newLog, ...allLogs]
          localStorage.setItem('contractLogs', JSON.stringify(updatedLogs))
          setSidebarContractLogs(prevLogs => [newLog, ...prevLogs])
        }
      }

      setContracts(prevContracts => prevContracts.map(contract =>
        contract.id === sidebarContract.id ? sidebarContract : contract
      ))
    }

    setIsSidebarOpen(false)
    setSidebarContract(null)
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
        <DashboardNav />
        
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
                          <p className="mt-1 text-sm text-gray-500">
                            合約編號：{sidebarContract.contractNo}
                          </p>
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
                            <div className="flex space-x-4">
                              <input
                                type="text"
                                value={sidebarContract.memberName}
                                onChange={(e) => setSidebarContract({...sidebarContract, memberName: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="會員姓名"
                              />
                              <input
                                type="text"
                                value={sidebarContract.memberNo}
                                onChange={(e) => setSidebarContract({...sidebarContract, memberNo: e.target.value})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="會員編號"
                              />
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
                          <div className="space-y-4">
                            {sidebarContractLogs.map(log => (
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
                            {sidebarContractLogs.length === 0 && (
                              <div className="text-center py-4 text-sm text-gray-500">
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
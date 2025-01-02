import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { Member, RelatedMember, Investment, MemberLog } from '@prisma/client'

interface MemberDetailProps {
  member: Member & {
    relatedMembers: RelatedMember[]
    investments: Investment[]
    logs: MemberLog[]
  }
  onUpdate?: (member: Member) => void
  onClose?: () => void
  isFullPage?: boolean
}

export default function MemberDetail({ member: initialMember, onUpdate, onClose, isFullPage = false }: MemberDetailProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [member, setMember] = useState(initialMember)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setMember(initialMember)
  }, [initialMember])

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...member,
          operator: user?.email || user?.name
        }),
      })

      if (!response.ok) {
        throw new Error('更新失敗')
      }

      const updatedMember = await response.json()
      setMember(updatedMember)
      setIsEditing(false)
      if (onUpdate) {
        onUpdate(updatedMember)
      }
    } catch (error) {
      console.error('更新失敗:', error)
      // TODO: 顯示錯誤訊息
    }
  }

  const handleCancel = () => {
    setMember(initialMember)
    setIsEditing(false)
  }

  const handleFileUpload = async (file: File, type: 'front' | 'back') => {
    // TODO: 實作檔案上傳 API
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('上傳失敗')
      }
      
      const { url } = await response.json()
      setMember({
        ...member,
        [type === 'front' ? 'idCardFront' : 'idCardBack']: url
      })
    } catch (error) {
      console.error('上傳失敗:', error)
      // TODO: 顯示錯誤訊息
    }
  }

  // 計算年齡
  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday)
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
    const age = calculateAge(birthday)
    setMember({
      ...member,
      birthday: new Date(birthday),
      age
    })
  }

  // 計算剩餘天數
  const calculateRemainingDays = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // 當會員期限變更時更新剩餘天數
  const handleMembershipEndDateChange = (endDate: string) => {
    const remainingDays = calculateRemainingDays(endDate)
    setMember({
      ...member,
      membershipEndDate: new Date(endDate),
      remainingDays
    })
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

  return (
    <div className={`bg-white ${isFullPage ? '' : 'h-full flex flex-col'}`}>
      {/* 標題列 */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-12 w-12">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl font-medium text-blue-600">
                  {member.name[0]}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {member.name}
                {member.nickname && (
                  <span className="ml-2 text-base text-gray-500">
                    ({member.nickname})
                  </span>
                )}
              </h2>
              <div className="mt-1 flex items-center space-x-4">
                <p className="text-sm text-gray-500">
                  會員編號：{member.memberNo}
                </p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  member.status === 'active' ? 'bg-green-100 text-green-800' :
                  member.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {member.status === 'active' ? '啟用' :
                   member.status === 'inactive' ? '停用' :
                   member.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!isFullPage && (
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">關閉</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 會員資料 */}
      <div className={`flex-1 px-4 py-6 sm:px-6 overflow-y-auto bg-gray-50 ${isFullPage ? 'max-w-7xl mx-auto' : ''}`}>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
          {/* 基本資料 */}
          <div className="sm:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">基本資料</h3>
          </div>
          
          {/* ... 其他欄位 ... */}
          
        </dl>

        {/* 使用記錄 */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">使用記錄</h3>
          <div className="space-y-4">
            {member.logs.map(log => (
              <div key={log.id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-sm text-gray-500">{log.details}</p>
                    {log.changes && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(log.changes as any).map(([field, values]: [string, any], index) => (
                          <p key={index} className="text-sm text-gray-500">
                            {field}: {values.oldValue} → {values.newValue}
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">操作人員：{log.operator}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString('zh-TW', { hour12: false })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="flex-shrink-0 px-4 py-4 flex justify-end space-x-3 border-t border-gray-200 bg-white sticky bottom-0 z-10">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleUpdate}
              className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              儲存
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              取消
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            編輯
          </button>
        )}
      </div>
    </div>
  )
} 
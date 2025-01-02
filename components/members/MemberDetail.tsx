import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Member, MemberLog, MemberWithRelations, RelatedMember } from '@/types'

interface MemberDetailProps {
  member: MemberWithRelations
  onUpdate?: (member: MemberWithRelations) => void
  onClose?: () => void
  allMembers?: Member[]
}

interface ShowFullImage {
  type: 'front' | 'back' | null
  url: string | null
}

export default function MemberDetail({ member: initialMember, onUpdate, onClose, allMembers }: MemberDetailProps) {
  const { user, isAuthenticated } = useAuth()
  const [member, setMember] = useState<MemberWithRelations>(initialMember)
  const [showFullImage, setShowFullImage] = useState<ShowFullImage>({ type: null, url: null })
  const [idNumberError, setIdNumberError] = useState<string | null>(null)

  useEffect(() => {
    setMember(initialMember)
  }, [initialMember])

  const handleShowImage = (type: 'front' | 'back', url: string | undefined) => {
    if (url) {
      setShowFullImage({ type, url })
    }
  }

  // 檢查身分證字號是否重複
  const checkIdNumberDuplicate = async (idNumber: string) => {
    if (!idNumber) return

    try {
      const response = await fetch(`/api/members/check-id-number?idNumber=${idNumber}&excludeId=${member.id}`)
      if (!response.ok) {
        throw new Error('檢查失敗')
      }
      
      const data = await response.json()
      if (data.isDuplicate) {
        setIdNumberError('此身分證字號已被使用')
      } else {
        setIdNumberError(null)
      }
    } catch (error) {
      console.error('檢查身分證字號失敗:', error)
      setIdNumberError('檢查失敗，請稍後再試')
    }
  }

  // 處理身分證字號變更
  const handleIdNumberChange = (value: string) => {
    setMember(prev => ({
      ...prev,
      idNumber: value
    }))
    checkIdNumberDuplicate(value)
  }

  const handleUpdate = async () => {
    if (!isAuthenticated) {
      // TODO: 顯示登入提示
      return
    }

    if (idNumberError) {
      alert('請修正身分證字號的錯誤')
      return
    }

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
  }

  const handleFileUpload = async (file: File, type: 'front' | 'back') => {
    try {
      // 將檔案轉換為 base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        const base64String = reader.result as string
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64String,
            type: type === 'front' ? 'idcard_front' : 'idcard_back'
          }),
        })
        
        if (!response.ok) {
          throw new Error('上傳失敗')
        }
        
        const { url } = await response.json()
        setMember({
          ...member,
          [type === 'front' ? 'idCardFront' : 'idCardBack']: url
        })
      }
    } catch (error) {
      console.error('上傳失敗:', error)
      // TODO: 顯示錯誤訊息
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'idCardFront' | 'idCardBack') => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('上傳失敗')
      }

      const data = await response.json()
      setMember(prev => ({
        ...prev,
        [type]: data.url
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('上傳圖片時發生錯誤')
    }
  }

  const handleRemoveImage = (type: 'idCardFront' | 'idCardBack') => {
    setMember(prev => ({
      ...prev,
      [type]: ''
    }))
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
    setMember(prev => ({
      ...prev,
      birthday: new Date(birthday),
      age
    }))
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
    setMember(prev => ({
      ...prev,
      membershipEndDate: new Date(endDate),
      remainingDays
    }))
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

  const handleFieldChange = (field: keyof MemberWithRelations, value: any) => {
    setMember(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="h-full flex flex-col bg-white">
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
            <button
              onClick={onClose}
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
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">會員編號</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.memberNo}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">會員分類</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.memberType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">姓名</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">暱稱</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.nickname || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">性別</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.gender}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">身分證字號</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.idNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">生日</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {member.birthday && new Date(member.birthday).toLocaleDateString('zh-TW')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">年齡</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.age}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">國籍</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.nationality || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">是否為美國公民</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.isUSCitizen ? '是' : '否'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">職業</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.occupation || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">飲食習慣</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.dietaryHabits || '-'}</dd>
              </div>
            </div>
          </div>

          {/* 聯絡資訊 */}
          <div className="sm:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">聯絡資訊</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">電話</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Line ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.lineId || '-'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">地址</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.address || '-'}</dd>
              </div>
            </div>
          </div>

          {/* 關係人資訊 */}
          <div className="sm:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">關係人資訊</h3>
            <div className="mt-4">
              {member.relatedMembers && member.relatedMembers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {member.relatedMembers.map((related, index) => {
                    const relatedMemberInfo = allMembers?.find(m => m.id === related.relatedMemberId)
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">關係人姓名</dt>
                            <dd className="mt-1 text-sm text-gray-900">{relatedMemberInfo?.name}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">關係</dt>
                            <dd className="mt-1 text-sm text-gray-900">{related.relationship}</dd>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">無關係人資訊</p>
              )}
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">介紹人</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {allMembers?.find(m => m.id === member.referrer)?.name || '-'}
                </dd>
              </div>
            </div>
          </div>

          {/* 緊急聯絡人 */}
          <div className="sm:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">緊急聯絡人</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">姓名</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.emergencyContact?.name || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">關係</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.emergencyContact?.relationship || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">電話</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.emergencyContact?.phone || '-'}</dd>
              </div>
            </div>
          </div>

          {/* 會員資訊 */}
          <div className="sm:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">會員資訊</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">加入時間</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {member.joinDate && new Date(member.joinDate).toLocaleDateString('zh-TW')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">入會條件</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.joinCondition || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">會員期限</dt>
                <dd className={`mt-1 text-sm ${member.remainingDays && member.remainingDays <= 0 ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                  {member.membershipStartDate && new Date(member.membershipStartDate).toLocaleDateString('zh-TW')} ~ 
                  {member.membershipEndDate && new Date(member.membershipEndDate).toLocaleDateString('zh-TW')}
                  {member.remainingDays && member.remainingDays <= 0 && (
                    <span className="ml-2 text-red-600 font-bold">
                      (已到期)
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">剩餘天數</dt>
                <dd className={`mt-1 text-sm ${getRemainingDaysColor(member.remainingDays)}`}>
                  {getRemainingDaysDisplay(member.remainingDays, member.hasMembershipPeriod)}
                  {member.remainingDays && member.remainingDays <= 30 && (
                    <span className="ml-2 text-xs text-red-600">
                      {getRemainingDaysMessage(member.remainingDays)}
                    </span>
                  )}
                </dd>
              </div>
            </div>
          </div>

          {/* 其他資訊 */}
          <div className="sm:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">其他資訊</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">家庭狀況</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.familyStatus || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">學歷</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.education || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">專長</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.expertise?.join(', ') || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">禁忌</dt>
                <dd className="mt-1 text-sm text-gray-900">{member.taboos?.join(', ') || '-'}</dd>
              </div>
            </div>
          </div>

          {/* 附件 */}
          <div className="sm:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">附件</h3>
            <div className="mt-4">
              <dt className="text-sm font-medium text-gray-500 mb-2">身分證影本</dt>
              <dd className="mt-1 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">正面</label>
                  {member.idCardFront ? (
                    <div className="mt-1 relative">
                      <img 
                        src={member.idCardFront} 
                        alt="身分證正面" 
                        className="h-32 w-48 object-cover cursor-pointer"
                        onClick={() => handleShowImage('front', member.idCardFront)}
                      />
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-500">未上傳</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">背面</label>
                  {member.idCardBack ? (
                    <div className="mt-1 relative">
                      <img 
                        src={member.idCardBack} 
                        alt="身分證背面" 
                        className="h-32 w-48 object-cover cursor-pointer"
                        onClick={() => handleShowImage('back', member.idCardBack)}
                      />
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-500">未上傳</div>
                  )}
                </div>
              </dd>
            </div>
          </div>

          {/* 投資履歷 */}
          <div className="sm:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">投資履歷</h3>
            <div className="mt-4">
              {member.investments && member.investments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {member.investments.map((investment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">投資項目</dt>
                          <dd className="mt-1 text-sm text-gray-900">{investment.name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">投資金額</dt>
                          <dd className="mt-1 text-sm text-gray-900">{investment.amount}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">投資日期</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {investment.date && new Date(investment.date).toLocaleDateString('zh-TW')}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">狀態</dt>
                          <dd className="mt-1 text-sm text-gray-900">{investment.status}</dd>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">無投資紀錄</p>
              )}
            </div>
          </div>
        </dl>
      </div>

      {/* 全螢幕圖片預覽 */}
      {showFullImage.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-screen p-4">
            <img
              src={showFullImage.url}
              alt={`身分證${showFullImage.type === 'front' ? '正面' : '背面'}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setShowFullImage({ type: null, url: null })}
              className="absolute top-2 right-2 p-2 bg-white rounded-full text-gray-800 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
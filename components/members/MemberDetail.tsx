import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

interface Member {
  id: string
  memberNo: string
  name: string
  nickname?: string | null
  gender: string
  phone: string
  email?: string | null
  birthday: Date
  age?: number | null
  address?: string | null
  idNumber: string
  status: string
  memberType: string
  membershipStartDate?: Date | null
  membershipEndDate?: Date | null
  remainingDays?: number | null
  occupation?: string | null
  lineId?: string | null
  notes?: string | null
  nationality?: string | null
  isUsCitizen?: boolean | null
  dietaryRestrictions?: string | null
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  } | null
  familyStatus?: string | null
  education?: string | null
  expertise?: string | null
  restrictions?: string | null
  joinCondition?: string | null
  referrer?: string | null
  idCardImage?: string | null
}

interface MemberDetailProps {
  member: Member | null
  open: boolean
  setOpen: (open: boolean) => void
}

export default function MemberDetail({ member, open, setOpen }: MemberDetailProps) {
  if (!member) return null

  const memberDetails = [
    // 基本資料
    {
      title: '基本資料',
      items: [
        { label: '會員編號', value: member.memberNo },
        { label: '會員分類', value: member.memberType },
        { label: '姓名', value: member.name },
        { label: '暱稱', value: member.nickname || '-' },
        { label: '性別', value: member.gender === 'male' ? '男' : '女' },
        { label: '身分證字號', value: member.idNumber },
        { label: '生日', value: member.birthday ? format(new Date(member.birthday), 'yyyy/MM/dd', { locale: zhTW }) : '-' },
        { label: '年齡', value: member.age || '-' },
        { label: '國籍', value: member.nationality || '-' },
        { label: '是否為美國公民', value: member.isUsCitizen ? '是' : '否' },
        { label: '職業', value: member.occupation || '-' },
        { label: '飲食習慣', value: member.dietaryRestrictions || '-' },
      ],
    },
    // 聯絡資訊
    {
      title: '聯絡資訊',
      items: [
        { label: '電話', value: member.phone },
        { label: 'Email', value: member.email || '-' },
        { label: 'Line ID', value: member.lineId || '-' },
        { label: '地址', value: member.address || '-' },
      ],
    },
    // 關係人資訊
    {
      title: '關係人資訊',
      items: [
        { label: '介紹人', value: member.referrer || '-' },
        // 關係人列表將在這裡添加
      ],
    },
    // 緊急聯絡人
    {
      title: '緊急聯絡人',
      items: member.emergencyContact ? [
        { label: '姓名', value: member.emergencyContact.name },
        { label: '關係', value: member.emergencyContact.relationship },
        { label: '電話', value: member.emergencyContact.phone },
      ] : [
        { label: '緊急聯絡人', value: '尚未設定' },
      ],
    },
    // 會員資訊
    {
      title: '會員資訊',
      items: [
        { label: '加入時間', value: member.membershipStartDate ? format(new Date(member.membershipStartDate), 'yyyy/MM/dd', { locale: zhTW }) : '-' },
        { label: '入會條件', value: member.joinCondition || '-' },
        { label: '會員期限', value: member.membershipEndDate ? format(new Date(member.membershipEndDate), 'yyyy/MM/dd', { locale: zhTW }) : '-' },
        { label: '剩餘天數', value: member.remainingDays || '-' },
      ],
    },
    // 其他資訊
    {
      title: '其他資訊',
      items: [
        { label: '家庭狀況', value: member.familyStatus || '-' },
        { label: '學歷', value: member.education || '-' },
        { label: '專長', value: member.expertise || '-' },
        { label: '禁忌', value: member.restrictions || '-' },
      ],
    },
    // 附件
    {
      title: '附件',
      items: [
        { label: '身分證影本', value: member.idCardImage ? '已上傳' : '未上傳' },
      ],
    },
    // 投資履歷
    {
      title: '投資履歷',
      items: [
        // 投資項目列表將在這裡添加
        { label: '投資項目', value: '尚未有投資紀錄' },
      ],
    },
  ]

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          會員詳細資料
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-blue-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">關閉面板</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Main */}
                    <div className="divide-y divide-gray-200">
                      {memberDetails.map((section) => (
                        <div key={section.title} className="px-4 py-6 sm:px-6">
                          <h3 className="text-base font-semibold leading-7 text-gray-900 mb-4">
                            {section.title}
                          </h3>
                          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            {section.items.map((detail) => (
                              <div key={detail.label} className={
                                detail.label === '地址' ? 'sm:col-span-2' : 'sm:col-span-1'
                              }>
                                <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                                <dd className="mt-1 text-sm text-gray-900">{detail.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 
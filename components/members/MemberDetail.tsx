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
}

interface MemberDetailProps {
  member: Member | null
  open: boolean
  setOpen: (open: boolean) => void
}

export default function MemberDetail({ member, open, setOpen }: MemberDetailProps) {
  if (!member) return null

  const memberDetails = [
    // 會員基本資訊
    {
      title: '會籍資訊',
      items: [
        { label: '會員編號', value: member.memberNo },
        { label: '會員類型', value: member.memberType },
        { label: '會員狀態', value: member.status },
        { label: '會籍開始日期', value: member.membershipStartDate ? format(new Date(member.membershipStartDate), 'yyyy/MM/dd', { locale: zhTW }) : '-' },
        { label: '會籍結束日期', value: member.membershipEndDate ? format(new Date(member.membershipEndDate), 'yyyy/MM/dd', { locale: zhTW }) : '-' },
        { label: '剩餘天數', value: member.remainingDays || '-' },
      ],
    },
    // 個人基本資料
    {
      title: '個人資料',
      items: [
        { label: '姓名', value: member.name },
        { label: '暱稱', value: member.nickname || '-' },
        { label: '性別', value: member.gender === 'male' ? '男' : '女' },
        { label: '生日', value: member.birthday ? format(new Date(member.birthday), 'yyyy/MM/dd', { locale: zhTW }) : '-' },
        { label: '年齡', value: member.age || '-' },
        { label: '身分證字號', value: member.idNumber },
      ],
    },
    // 聯絡資訊
    {
      title: '聯絡資訊',
      items: [
        { label: '電話', value: member.phone },
        { label: '電子郵件', value: member.email || '-' },
        { label: 'Line ID', value: member.lineId || '-' },
        { label: '地址', value: member.address || '-' },
      ],
    },
    // 其他資訊
    {
      title: '其他資訊',
      items: [
        { label: '職業', value: member.occupation || '-' },
        { label: '備註', value: member.notes || '-' },
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
                              <div key={detail.label} className="sm:col-span-1">
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
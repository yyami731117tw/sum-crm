import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Member } from '@prisma/client'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

interface MemberDetailProps {
  member: Member | null
  open: boolean
  setOpen: (open: boolean) => void
}

export default function MemberDetail({ member, open, setOpen }: MemberDetailProps) {
  if (!member) return null

  const memberDetails = [
    { label: '會員編號', value: member.memberNo },
    { label: '會員類型', value: member.memberType },
    { label: '會員狀態', value: member.status },
    { label: '會籍開始日期', value: member.membershipStartDate ? format(new Date(member.membershipStartDate), 'yyyy/MM/dd', { locale: zhTW }) : '-' },
    { label: '會籍結束日期', value: member.membershipEndDate ? format(new Date(member.membershipEndDate), 'yyyy/MM/dd', { locale: zhTW }) : '-' },
    { label: '剩餘天數', value: member.remainingDays || '-' },
    { label: '姓名', value: member.name },
    { label: '暱稱', value: member.nickname || '-' },
    { label: '性別', value: member.gender === 'male' ? '男' : '女' },
    { label: '生日', value: member.birthday ? format(new Date(member.birthday), 'yyyy/MM/dd', { locale: zhTW }) : '-' },
    { label: '年齡', value: member.age || '-' },
    { label: '身分證字號', value: member.idNumber },
    { label: '電話', value: member.phone },
    { label: '電子郵件', value: member.email || '-' },
    { label: 'Line ID', value: member.lineId || '-' },
    { label: '地址', value: member.address || '-' },
    { label: '職業', value: member.occupation || '-' },
    { label: '備註', value: member.notes || '-' },
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
                      <div className="pb-6">
                        <div className="h-full">
                          <dl className="space-y-6 px-4 sm:px-6">
                            {memberDetails.map((detail) => (
                              <div key={detail.label}>
                                <dt className="text-sm font-medium leading-6 text-gray-900">{detail.label}</dt>
                                <dd className="mt-1 text-sm leading-6 text-gray-700">{detail.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
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
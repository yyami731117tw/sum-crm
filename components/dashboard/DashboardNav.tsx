import { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { HomeIcon, UsersIcon, FolderIcon, DocumentTextIcon, CalendarIcon, CogIcon } from '@heroicons/react/24/outline'

export const DashboardNav: FC = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!loading && user?.role === 'admin') {
      setIsAdmin(true)
    }
  }, [loading, user])

  const showAdminMenu = isAdmin

  const navigation = [
    { name: '儀表板', href: '/dashboard', icon: HomeIcon },
    { name: '會員管理', href: '/admin/members', icon: UsersIcon },
    { name: '項目管理', href: '/admin/projects', icon: FolderIcon },
    { name: '合約管理', href: '/admin/contracts', icon: DocumentTextIcon },
    { name: '活動管理', href: '/admin/events', icon: CalendarIcon },
    { name: '系統設定', href: '/admin/settings', icon: CogIcon },
  ]

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                MBC天使俱樂部
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-b-2 border-blue-500 text-gray-900'
                        : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={() => router.push('/profile')}
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">開啟使用者選單</span>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {(user?.name || user?.email || '')[0]?.toUpperCase()}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNav 
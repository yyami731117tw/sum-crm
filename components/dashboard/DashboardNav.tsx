import { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { HomeIcon, UsersIcon, FolderIcon, DocumentTextIcon, CogIcon, UserCircleIcon } from '@heroicons/react/24/outline'

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
    { name: '首頁', href: '/', icon: HomeIcon },
    { name: '會員管理', href: '/admin/members', icon: UsersIcon },
    { name: '合約管理', href: '/investments', icon: FolderIcon },
    { name: '項目管理', href: '/projects', icon: DocumentTextIcon },
    { name: '人員管理', href: '/admin/users', icon: UserCircleIcon },
  ]

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                MBC管理系統
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.name || user?.email}
            </span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {(user?.name || user?.email || '')[0]?.toUpperCase()}
              </span>
            </div>
            <Link
              href="/settings"
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              title="系統設定"
            >
              <CogIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNav 
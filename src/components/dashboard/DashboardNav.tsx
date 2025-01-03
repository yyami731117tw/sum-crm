import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from 'next-auth/react'

export function DashboardNav() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  if (loading) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-800">
                  MBC管理系統
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="text-sm text-gray-500">
              <span className="mr-4">使用者：{user?.name}</span>
              <span className="mr-4">狀態：{user?.status || '正常'}</span>
              <span>角色：{user?.role === 'admin' ? '管理員' : '一般使用者'}</span>
            </div>
          </div>
          <div className="flex space-x-8">
            <Link href="/" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
              首頁
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin/members" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                會員管理
              </Link>
            )}
            <Link href="/contracts" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
              合約管理
            </Link>
            <Link href="/projects" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
              項目管理
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin/users" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                人員管理
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 
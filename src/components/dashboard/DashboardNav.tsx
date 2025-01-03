import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

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
      <nav className="bg-white shadow fixed top-0 left-0 right-0 z-50">
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
    <nav className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-800">
              MBC管理系統
            </span>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
              首頁
            </Link>
            <Link href="/admin/members" className="text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
              會員管理
            </Link>
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
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 text-gray-900 hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium"
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || '使用者頭像'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      個人資料
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      設定
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      登出
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 
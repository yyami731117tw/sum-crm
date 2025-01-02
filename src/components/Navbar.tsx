import { useRouter } from 'next/router'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('登出時發生錯誤:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const isActive = (path: string) => {
    return router.pathname === path ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="MBC Logo"
              />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="/"
                className={`${isActive('/')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                首頁
              </a>
              <a
                href="/members"
                className={`${isActive('/members')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                會員管理
              </a>
              <a
                href="/investments"
                className={`${isActive('/investments')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                投資項目
              </a>
              <a
                href="/contracts"
                className={`${isActive('/contracts')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                合約管理
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <div className="ml-3 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.name?.[0]}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoggingOut ? '登出中...' : '登出'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 
import type { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

export const DashboardNav: FC = () => {
  const { isAdmin, logout, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    console.log('DashboardNav - Current user:', user)
    console.log('DashboardNav - Is admin?', isAdmin())
  }, [user, isAdmin])

  const handleLogout = () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    logout().catch(error => {
      console.error('登出失敗:', error)
      setIsLoggingOut(false)
    })
  }

  const showAdminMenu = isAdmin()

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="多元商 Logo"
                  fill
                  sizes="40px"
                  priority
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-semibold text-gray-900 whitespace-nowrap">多元商會員管理系統</span>
            </Link>
            <div className="flex items-center space-x-6">
              <NavLink href="/dashboard">首頁</NavLink>
              <NavLink href="/members">會員管理</NavLink>
              <NavLink href="/contracts">合約管理</NavLink>
              <NavLink href="/projects">項目管理</NavLink>
              {showAdminMenu && (
                <NavLink href="/admin/people">人員管理</NavLink>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">通知</span>
              🔔
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">設定</span>
              ⚙️
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoggingOut ? '登出中...' : '登出'}</span>
              <span>🚪</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

const NavLink: FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children
}) => (
  <Link
    href={href}
    className="text-gray-600 hover:text-gray-900 font-medium"
  >
    {children}
  </Link>
) 
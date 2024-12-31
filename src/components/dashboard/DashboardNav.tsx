import type { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export const DashboardNav: FC = () => {
  const { isAdmin, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (error) {
      console.error('登出失敗:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="MBC Logo"
                  fill
                  sizes="40px"
                  priority
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-semibold text-gray-900 whitespace-nowrap">MBC天使俱樂部</span>
            </Link>
            <div className="flex items-center space-x-6">
              <NavLink href="/dashboard">儀表板</NavLink>
              {isAdmin() && (
                <>
                  <NavLink href="/admin/users">會員管理</NavLink>
                  <NavLink href="/admin/contracts">合約管理</NavLink>
                  <NavLink href="/admin/projects">項目管理</NavLink>
                </>
              )}
              <NavLink href="/members">會員資料</NavLink>
              <NavLink href="/settings">設定</NavLink>
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
import type { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

export const DashboardNav: FC = () => {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    console.log('DashboardNav - Current user:', user)
    console.log('DashboardNav - Is admin?', isAdmin)
  }, [user, isAdmin])

  const handleLogout = () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    logout().catch(error => {
      console.error('登出失敗:', error)
      setIsLoggingOut(false)
    })
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const showAdminMenu = isAdmin

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button onClick={() => handleNavigation('/')} className="flex items-center space-x-3">
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
            </button>
            <div className="flex items-center space-x-6">
              <NavButton
                href="/dashboard"
                active={router.pathname === '/dashboard'}
                onClick={() => handleNavigation('/dashboard')}
              >
                首頁
              </NavButton>
              <NavButton
                href="/members"
                active={router.pathname === '/members'}
                onClick={() => handleNavigation('/members')}
              >
                會員管理
              </NavButton>
              <NavButton
                href="/contracts"
                active={router.pathname === '/contracts'}
                onClick={() => handleNavigation('/contracts')}
              >
                合約管理
              </NavButton>
              <NavButton
                href="/projects"
                active={router.pathname === '/projects'}
                onClick={() => handleNavigation('/projects')}
              >
                項目管理
              </NavButton>
              {showAdminMenu && (
                <NavButton
                  href="/admin/people"
                  active={router.pathname === '/admin/people'}
                  onClick={() => handleNavigation('/admin/people')}
                >
                  人員管理
                </NavButton>
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

interface NavButtonProps {
  href: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

const NavButton: FC<NavButtonProps> = ({
  href,
  active,
  onClick,
  children
}) => (
  <button
    onClick={onClick}
    className={`text-gray-600 hover:text-gray-900 font-medium ${
      active ? 'text-blue-600 font-semibold' : ''
    }`}
  >
    {children}
  </button>
) 
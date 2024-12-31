import type { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'

export const DashboardNav: FC = () => {
  const { isAdmin } = useAuth()

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="多元商會 Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
              <span className="text-xl font-semibold text-gray-900">MBC天使俱樂部</span>
            </Link>
            <div className="flex items-center space-x-6">
              <NavLink href="/dashboard">儀表板</NavLink>
              {isAdmin() && (
                <NavLink href="/admin/users">會員管理</NavLink>
              )}
              <NavLink href="/reports">報表</NavLink>
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
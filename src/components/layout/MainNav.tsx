import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { PATHS } from '@/utils/paths'

export function MainNav() {
  const router = useRouter()
  const { session, status, logout } = useAuth()
  const user = session?.user

  const handleSignOut = async () => {
    await logout()
    router.push(PATHS.login)
  }

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={PATHS.home} className="text-xl font-bold text-gray-800">
                MBC天使俱樂部
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href={PATHS.members}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  router.pathname === PATHS.members
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                會員管理
              </Link>
              <Link
                href={PATHS.contracts}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  router.pathname === PATHS.contracts
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                合約管理
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/admin/users"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    router.pathname === '/admin/users'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  使用者管理
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              {status === 'authenticated' ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href={PATHS.profile}
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    {user?.name || user?.email}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-700 hover:text-gray-900"
                  >
                    登出
                  </button>
                </div>
              ) : (
                <Link
                  href={PATHS.login}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  登入
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 
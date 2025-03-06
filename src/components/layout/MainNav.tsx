import { useRouter } from 'next/router'
import Link from 'next/link'
import { Users, UserPlus, Settings, LogOut, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  current: boolean
}

export function MainNav(): JSX.Element {
  const router = useRouter()
  const { logout } = useAuth()
  const pathname = router.pathname

  const navigation: NavigationItem[] = [
    {
      name: '會員管理',
      href: '/members',
      icon: UserPlus,
      current: pathname === '/members'
    },
    {
      name: '合約管理',
      href: '/contracts',
      icon: FileText,
      current: pathname === '/contracts'
    },
    {
      name: '用戶管理',
      href: '/users',
      icon: Users,
      current: pathname === '/users'
    },
    {
      name: '系統設置',
      href: '/settings',
      icon: Settings,
      current: pathname === '/settings'
    }
  ]

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">
            MBC管理系統
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  className={`mr-2 px-4 py-2 rounded-md ${
                    item.current
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4 inline" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <button
            className="ml-auto px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4 inline" />
            登出
          </button>
        </div>
      </div>
    </nav>
  )
} 
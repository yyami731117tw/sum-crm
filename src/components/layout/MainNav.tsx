import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { Users, UserPlus, Settings, LogOut } from 'lucide-react'

export function MainNav() {
  const router = useRouter()
  const { logout } = useAuth()
  const pathname = router.pathname

  const navigation = [
    {
      name: '用戶管理',
      href: '/users',
      icon: Users,
      current: pathname === '/users'
    },
    {
      name: '會員管理',
      href: '/members',
      icon: UserPlus,
      current: pathname === '/members'
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
                  className={`mr-2 flex items-center px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    item.current ? 'bg-accent text-accent-foreground' : 'text-foreground'
                  }`}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <button
            className="ml-auto flex items-center px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            登出
          </button>
        </div>
      </div>
    </nav>
  )
} 
import { 
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
  Button,
  Stack,
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useNotifications } from '@/contexts/NotificationContext'

interface TopNavbarProps {
  onAvatarClick: () => void
  pageTitle: string
}

const navItems = [
  { text: '首頁', path: '/' },
  { text: '會員管理', path: '/members' },
  { text: '合約管理', path: '/contracts' },
  { text: '項目管理', path: '/projects' },
  { text: '使用者管理', path: '/users' },
]

export default function TopNavbar({ onAvatarClick, pageTitle }: TopNavbarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { unreadCount, setIsDrawerOpen } = useNotifications()

  return (
    <AppBar 
      position="fixed" 
      color="inherit" 
      elevation={1}
      sx={{
        zIndex: 1200
      }}
    >
      <Toolbar>
        {/* 左側標題 */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          MBC管理系統
        </Typography>

        {/* 導航選單 */}
        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.text}
              onClick={() => router.push(item.path)}
              sx={{
                color: pathname === item.path ? 'primary.main' : 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                fontWeight: pathname === item.path ? 'bold' : 'normal',
                minWidth: 'auto',
                px: 2
              }}
            >
              {item.text}
            </Button>
          ))}
        </Stack>

        {/* 右側功能區 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="large" 
            color="inherit"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton 
            onClick={onAvatarClick}
            sx={{ ml: 1 }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: 'secondary.main'
              }}
            >
              {session?.user?.name?.[0] || 'U'}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
} 
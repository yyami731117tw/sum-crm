import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button
} from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle'
import { useAuth } from '@/hooks/useAuth'

export const DashboardNav = () => {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleProfile = () => {
    handleClose()
    router.push('/profile')
  }

  const handleLogout = async () => {
    handleClose()
    await logout()
  }

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MBC管理系統
        </Typography>
        {user && (
          <Box>
            <Button
              color="inherit"
              onClick={() => router.push('/dashboard')}
            >
              儀表板
            </Button>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>個人資料</MenuItem>
              <MenuItem onClick={handleLogout}>登出</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
} 
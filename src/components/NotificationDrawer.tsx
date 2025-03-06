'use client'

import { 
  Box, 
  Typography, 
  IconButton, 
  Drawer,
  Card,
  Button
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { useNotifications } from '@/contexts/NotificationContext'

export default function NotificationDrawer() {
  const { 
    notifications, 
    isDrawerOpen, 
    setIsDrawerOpen,
    markAsRead,
    markAllAsRead
  } = useNotifications()

  return (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="h6">通知中心</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {notifications.some(n => !n.isRead) && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{ textTransform: 'none' }}
              >
                全部標為已讀
              </Button>
            )}
            <IconButton onClick={() => setIsDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              sx={{ 
                p: 2,
                backgroundColor: notification.isRead ? 'white' : 'action.hover',
                border: '1px solid',
                borderColor: 'grey.200',
                cursor: 'pointer'
              }}
              onClick={() => markAsRead(notification.id)}
            >
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{notification.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                {!notification.isRead && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main'
                    }}
                  />
                )}
              </Box>
            </Card>
          ))}
          {notifications.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: 'text.secondary'
            }}>
              <Typography variant="body1">目前沒有通知</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  )
} 
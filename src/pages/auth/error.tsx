import { useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert
} from '@mui/material'

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!error) {
        router.push('/auth/login')
      }
    }, 3000) // 3秒後自動重定向

    return () => clearTimeout(timer)
  }, [error, router])

  const handleReturn = () => {
    router.push('/auth/login')
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            登入錯誤
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {decodeURIComponent(error as string || '發生未知錯誤')}
          </Alert>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            3 秒後自動返回登入頁面
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={handleReturn}
          >
            立即返回登入
          </Button>
        </Paper>
      </Box>
    </Container>
  )
} 
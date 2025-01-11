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
    if (!error) {
      router.push('/auth/login')
    }
  }, [error, router])

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
            {error || '發生未知錯誤'}
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => router.push('/auth/login')}
          >
            返回登入
          </Button>
        </Paper>
      </Box>
    </Container>
  )
} 
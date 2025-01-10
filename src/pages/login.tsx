import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material'

export default function Login() {
  const router = useRouter()
  const { login, error, clearError, status } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLocalError('')
    clearError()

    if (!email || !password) {
      setLocalError('請輸入信箱和密碼')
      setLoading(false)
      return
    }

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/')
      }
    } catch (err) {
      console.error('Login error:', err)
      setLocalError('登入時發生錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
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
            MBC管理系統
          </Typography>
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || localError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="電子郵件"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              error={!!localError && !email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密碼"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={!!localError && !password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : '登入'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
} 
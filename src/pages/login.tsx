import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {}
  }
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('請輸入信箱和密碼')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      setError('登入時發生錯誤，請稍後再試')
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="電子郵件"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              error={!!error}
              autoFocus
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
              error={!!error}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !email || !password}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : '登入'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
} 
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Alert, Box, Button, Container, TextField, Typography, CircularProgress } from '@mui/material'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    try {
      setLoading(true)
      setError('')

      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
        callbackUrl: '/',
        action: '/api/auth/callback/credentials'
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.ok) {
        router.push(result.url || '/')
      }
    } catch (error) {
      setError('登入時發生錯誤，請稍後再試')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>登入 | MBC管理系統</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            登入
          </Typography>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ mt: 1, width: '100%' }}
            noValidate
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="信箱"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              error={!!error}
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
              sx={{ mt: 3, mb: 2, position: 'relative', height: 48 }}
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                  處理中...
                </>
              ) : (
                '登入'
              )}
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  )
} 
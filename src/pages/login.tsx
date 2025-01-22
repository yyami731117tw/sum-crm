import { useState } from 'react'
import { signIn, SignInResponse } from 'next-auth/react'
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

      const response = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false
      }) as SignInResponse

      if (!response) {
        throw new Error('登入失敗：伺服器無回應')
      }

      if (response.error) {
        setError(response.error)
        return
      }

      if (response.ok) {
        const returnUrl = router.query.callbackUrl as string || '/'
        window.location.href = returnUrl
      } else {
        setError('登入失敗，請檢查您的帳號密碼')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : '登入時發生錯誤，請稍後再試')
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
              inputProps={{
                maxLength: 255
              }}
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
              inputProps={{
                maxLength: 255
              }}
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
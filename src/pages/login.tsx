import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Fade,
  InputAdornment,
  IconButton
} from '@mui/material'
import Head from 'next/head'
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material'

export default function Login() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const { error } = router.query
    if (error) {
      setError(Array.isArray(error) ? error[0] : error)
    }
  }, [router.query])

  useEffect(() => {
    if (status === 'authenticated' && mounted) {
      router.replace('/')
    }
  }, [status, router, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    
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
        redirect: false,
        callbackUrl: '/'
      })

      console.log('Sign in result:', result)

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.url) {
        await router.replace(result.url)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('登入時發生錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && email && password) {
      handleSubmit(e)
    }
  }

  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)'
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    )
  }

  if (status === 'authenticated') {
    router.replace('/')
    return null
  }

  return (
    <>
      <Head>
        <title>登入 | MBC管理系統</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
          p: 2
        }}
      >
        <Fade in={mounted}>
          <Container maxWidth="sm">
            <Paper
              elevation={6}
              sx={{
                p: { xs: 3, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  mb: 4,
                  fontWeight: 700,
                  color: '#1976d2',
                  textAlign: 'center'
                }}
              >
                MBC管理系統
              </Typography>

              {error && (
                <Fade in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      width: '100%',
                      mb: 2,
                      '& .MuiAlert-message': {
                        width: '100%'
                      }
                    }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <Box 
                component="form" 
                onSubmit={handleSubmit}
                sx={{ 
                  width: '100%',
                  mt: 1
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="電子郵件"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  error={!!error}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="密碼"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  error={!!error}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || !email || !password}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    '登入'
                  )}
                </Button>
              </Box>
            </Paper>
          </Container>
        </Fade>
      </Box>
    </>
  )
} 
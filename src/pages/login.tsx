import { useState } from 'react'
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
  Alert
} from '@mui/material'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'

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
  const router = useRouter()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        redirect: true,
        callbackUrl: '/'
      })
    } catch (err) {
      console.error('Login error:', err)
      setError('登入時發生錯誤，請稍後再試')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>登入 - MBC管理系統</title>
      </Head>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              width: '100%',
              maxWidth: 400,
              borderRadius: 2
            }}
          >
            <Typography 
              component="h1" 
              variant="h5" 
              align="center" 
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 3 }}
            >
              MBC管理系統
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {router.query.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {router.query.error}
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
                sx={{ mb: 2 }}
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
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !email || !password}
                sx={{ 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? <CircularProgress size={24} /> : '登入'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  )
} 
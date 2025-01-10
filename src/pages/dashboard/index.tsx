import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/Layout'
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper
} from '@mui/material'

export default function Dashboard() {
  const router = useRouter()
  const { user, status } = useAuth()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading' || !user) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography>載入中...</Typography>
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                歡迎回來，{user.name || user.email}
              </Typography>
              <Typography>
                角色：{user.role === 'admin' ? '管理員' : '一般用戶'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  )
} 
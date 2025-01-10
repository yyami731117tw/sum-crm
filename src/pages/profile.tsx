import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserProfile } from '@/types/user'
import { Layout } from '@/components/Layout'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material'
import { toast } from 'react-toastify'

interface ProfileFormData {
  name: string
  email: string
  phone: string
  lineId: string
  address: string
  birthday: string
  nickname: string
}

const Profile: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    lineId: '',
    address: '',
    birthday: '',
    nickname: ''
  })

  useEffect(() => {
    if (user) {
      setProfile(user as UserProfile)
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        lineId: user.lineId || '',
        address: user.address || '',
        birthday: user.birthday || '',
        nickname: user.nickname || ''
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: 實作更新個人資料的 API 呼叫
      toast.success('個人資料更新成功')
      setIsEditing(false)
    } catch (error) {
      toast.error('更新失敗，請稍後再試')
    }
  }

  if (loading || !profile) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            個人資料
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="姓名"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="暱稱"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="電話"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Line ID"
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="地址"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="生日"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  {!isEditing ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsEditing(true)}
                    >
                      編輯
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            name: profile.name || '',
                            email: profile.email || '',
                            phone: profile.phone || '',
                            lineId: profile.lineId || '',
                            address: profile.address || '',
                            birthday: profile.birthday || '',
                            nickname: profile.nickname || ''
                          })
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                      >
                        儲存
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Layout>
  )
}

export default Profile 

export async function getServerSideProps() {
  return {
    props: {},
  }
} 
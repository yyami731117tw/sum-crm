'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material'
import TopNavbar from '@/components/TopNavbar'
import RightSidebar from '@/components/RightSidebar'

interface Member {
  id: string
  name: string
  email: string
  joinDate: string
  membershipEndDate?: string
  status: string
  isDeleted?: boolean
}

interface DashboardStats {
  totalMembers: number
  newMembersThisMonth: number
  activeMembers: number
  pendingTasks: number
  recentActivities: {
    id: string
    type: string
    action: string
    target: string
    date: string
  }[]
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    newMembersThisMonth: 0,
    activeMembers: 0,
    pendingTasks: 0,
    recentActivities: []
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const savedMembers = localStorage.getItem('members')
    const members: Member[] = savedMembers ? JSON.parse(savedMembers) : []
    
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // 計算會員總數（不包含已刪除的會員）
    const totalMembers = members.filter(member => !member.isDeleted).length
    
    // 計算本月新增會員（不包含已刪除的會員）
    const newMembersThisMonth = members.filter(member => {
      if (member.isDeleted) return false
      try {
        const joinDate = new Date(member.joinDate)
        return joinDate >= firstDayOfMonth
      } catch (error) {
        console.error('日期解析錯誤:', error)
        return false
      }
    }).length
    
    // 計算活躍會員（不包含已刪除和已過期的會員）
    const activeMembers = members.filter(member => {
      if (member.isDeleted || member.status === '已停用') return false
      if (!member.membershipEndDate) return true
      try {
        const endDate = new Date(member.membershipEndDate)
        return endDate > now
      } catch (error) {
        console.error('日期解析錯誤:', error)
        return false
      }
    }).length
    
    // 計算待處理事項
    const pendingTasks = members.filter(member => 
      !member.isDeleted && member.status === '待審核'
    ).length

    setStats({
      totalMembers,
      newMembersThisMonth,
      activeMembers,
      pendingTasks,
      recentActivities: []
    })
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 從 localStorage 獲取會員資料
        const savedMembers = localStorage.getItem('members')
        const members: Member[] = savedMembers ? JSON.parse(savedMembers) : []
        
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const stats: DashboardStats = {
          totalMembers: members.filter(member => !member.isDeleted).length,
          newMembersThisMonth: members.filter(member => {
            if (member.isDeleted) return false
            try {
              const joinDate = new Date(member.joinDate)
              return joinDate >= firstDayOfMonth
            } catch (error) {
              console.error('日期解析錯誤:', error)
              return false
            }
          }).length,
          activeMembers: members.filter(member => {
            if (member.isDeleted || member.status === '已停用') return false
            if (!member.membershipEndDate) return true
            try {
              const endDate = new Date(member.membershipEndDate)
              return endDate > now
            } catch (error) {
              console.error('日期解析錯誤:', error)
              return false
            }
          }).length,
          pendingTasks: members.filter(member => 
            !member.isDeleted && member.status === '待審核'
          ).length,
          recentActivities: []
        }
        
        setStats(stats)
      } catch (error) {
        console.error('獲取統計數據失敗:', error)
        setError('獲取統計數據失敗，請稍後再試')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchStats()
      // 設置定時刷新（每5分鐘）
      const interval = setInterval(fetchStats, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [session])

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Box>
      <TopNavbar 
        onAvatarClick={() => setSidebarOpen(true)} 
        pageTitle="儀表板"
      />
      <RightSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'grey.100',
          minHeight: '100vh',
          pt: '64px'
        }}
      >
        <Box sx={{ py: 6 }}>
          <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 6, md: 8 } }}>
            {/* 歡迎訊息 */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'grey.900' }}>
                      歡迎回來，{session.user?.name || '使用者'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      祝您有個美好的一天！讓我們一起創造更多價值。
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                    {new Date().toLocaleDateString('zh-TW', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric', 
                      weekday: 'long' 
                    })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* 統計卡片區域 */}
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {/* 會員總數 */}
                  <Grid item xs={12} sm={6} lg={4}>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexShrink: 0 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100'
                            }}>
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </Box>
                          </Box>
                          <Box sx={{ ml: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              會員總數
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'semibold' }}>
                              {stats.totalMembers}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* 本月新增會員 */}
                  <Grid item xs={12} sm={6} lg={4}>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexShrink: 0 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100'
                            }}>
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </Box>
                          </Box>
                          <Box sx={{ ml: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              本月新增會員
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'semibold' }}>
                              {stats.newMembersThisMonth}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* 待處理事項 */}
                  <Grid item xs={12} sm={6} lg={4}>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexShrink: 0 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100'
                            }}>
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            </Box>
                          </Box>
                          <Box sx={{ ml: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              待處理事項
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'semibold' }}>
                              {stats.pendingTasks}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* 最近活動 */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: 'grey.900' }}>
                    最近活動
                  </Typography>
                  <Card>
                    <Box sx={{ 
                      '& > :not(:last-child)': {
                        borderBottom: 1,
                        borderColor: 'divider'
                      }
                    }}>
                      {stats.recentActivities.length > 0 ? (
                        stats.recentActivities.map((activity) => (
                          <Box key={activity.id} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                                  {activity.action}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {activity.target}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(activity.date).toLocaleDateString('zh-TW')}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ p: 3 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                            暫無活動記錄
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Box>
              </>
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  )
} 
'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNavbar from '@/components/TopNavbar'
import RightSidebar from '@/components/RightSidebar'
import { 
  Box, 
  Container, 
  Typography, 
  Card,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Link,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material'
import { Add, Search, Close, Upload, Description } from '@mui/icons-material'
import { toast, Toaster } from 'react-hot-toast'

interface Project {
  id: string
  projectNo: string
  projectCode: string
  name: string
  nameEn?: string
  countryCode?: string
  type: '房地產' | '股票' | '基金' | '股權投資' | '短期投資' | '其他'
  status: '籌備中' | '募資中' | '執行中' | '已結束' | '已取消'
  targetAmount: number
  minInvestAmount: number
  currentAmount: number
  investorCount: number
  startDate: string
  endDate: string
  description: string
  risks: string
  returns: string
  location?: string
  documents: {
    name: string
    url: string
    type: string
  }[]
  createdAt: string
  updatedAt: string
  currency: 'TWD' | 'USD'
}

interface Contract {
  id: string
  projectId: string
  memberId: string
  contractNo: string
  amount: number
  status: string
  signDate: string
  memberName: string
  memberStatus: string
  memberPhone: string
  memberEmail: string
  memberNo: string
}

interface Member {
  id: string
  name: string
  status: string
  phone: string
  email: string
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState<Partial<Project>>({
    type: '房地產',
    status: '籌備中',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currentAmount: 0,
    investorCount: 0,
    currency: 'TWD',
    targetAmount: 0
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // 檢查用戶權限
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
  }, [status, router])

  // 載入項目資料
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // 生成項目編號
  const generateProjectNo = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `PJ${year}${month}${day}${random}`
  }

  // 生成項目代碼
  const generateProjectCode = (nameEn: string = '', name: string = '', countryCode: string = '') => {
    const parts = []
    if (nameEn) parts.push(nameEn.toUpperCase())
    if (name) parts.push(name)
    if (countryCode) parts.push(countryCode.toUpperCase())
    return parts.join('-')
  }

  // 處理檔案上傳
  const handleFileUpload = (files: FileList | null) => {
    if (!files?.length) return
    setSelectedFiles(prev => [...prev, ...Array.from(files)])
  }

  // 移除已選擇的檔案
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 儲存項目
  const handleSaveProject = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 驗證必填欄位
      if (!newProject.name || !newProject.type || !newProject.targetAmount || !newProject.minInvestAmount) {
        throw new Error('請填寫所有必要欄位')
      }

      // 驗證金額
      if (newProject.minInvestAmount! > newProject.targetAmount!) {
        throw new Error('最低投資金額不能大於目標金額')
      }

      // 建立新項目
      const projectNo = generateProjectNo()
      const projectCode = generateProjectCode(newProject.nameEn, newProject.name, newProject.countryCode)
      const timestamp = new Date().toISOString()
      
      const project: Project = {
        id: `project_${Date.now()}`,
        projectNo,
        projectCode,
        name: newProject.name!,
        nameEn: newProject.nameEn,
        countryCode: newProject.countryCode,
        type: newProject.type as Project['type'],
        status: newProject.status as Project['status'],
        targetAmount: Number(newProject.targetAmount),
        minInvestAmount: Number(newProject.minInvestAmount),
        currentAmount: 0,
        investorCount: 0,
        startDate: newProject.startDate!,
        endDate: newProject.endDate!,
        description: newProject.description || '',
        risks: newProject.risks || '',
        returns: newProject.returns || '',
        location: newProject.location,
        documents: selectedFiles.map(file => ({
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type
        })),
        createdAt: timestamp,
        updatedAt: timestamp,
        currency: newProject.currency || 'TWD',
      }

      // 更新項目列表
      const updatedProjects = [...projects, project]
      setProjects(updatedProjects)
      localStorage.setItem('projects', JSON.stringify(updatedProjects))

      toast.success('項目建立成功')
      setIsCreateDialogOpen(false)
      
      // 重置表單
      setNewProject({
        type: '房地產',
        status: '籌備中',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentAmount: 0,
        investorCount: 0,
        currency: 'TWD',
        targetAmount: 0
      })
      setSelectedFiles([])

    } catch (error) {
      setError(error instanceof Error ? error.message : '建立項目時發生錯誤')
      toast.error(error instanceof Error ? error.message : '建立項目時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  // 取得狀態標籤顏色
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case '籌備中':
        return { bg: '#FEF3C7', text: '#92400E' }
      case '募資中':
        return { bg: '#DEF7EC', text: '#046C4E' }
      case '執行中':
        return { bg: '#E1EFFE', text: '#1E429F' }
      case '已結束':
        return { bg: '#F3F4F6', text: '#374151' }
      case '已取消':
        return { bg: '#FDE8E8', text: '#9B1C1C' }
      default:
        return { bg: '#F3F4F6', text: '#374151' }
    }
  }

  // 計算募資進度
  const calculateProgress = (projectId: string, targetAmount: number) => {
    if (targetAmount <= 0) return 0
    
    // 從 localStorage 獲取合約資料
    const savedContracts = JSON.parse(localStorage.getItem('contracts') || '[]')
    
    // 過濾出該項目的有效合約（進行中和已完成）
    const validContracts = savedContracts.filter(
      (contract: Contract) => 
        contract.projectId === projectId && 
        (contract.status === '進行中' || contract.status === '已完成')
    )
    
    // 計算有效合約的總金額
    const currentAmount = validContracts.reduce(
      (sum: number, contract: Contract) => sum + contract.amount, 
      0
    )
    
    // 計算進度百分比
    const progress = (currentAmount / targetAmount) * 100
    return Math.min(Math.round(progress * 10) / 10, 100)
  }

  // 處理狀態更改
  const handleStatusChange = (newStatus: Project['status']) => {
    if (!selectedProject) return

    const updatedProject = {
      ...selectedProject,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }

    // 如果狀態變更為已取消，檢查相關合約並發送通知
    if (newStatus === '已取消') {
      const savedContracts = JSON.parse(localStorage.getItem('contracts') || '[]')
      const relatedContracts = savedContracts.filter(
        (contract: Contract) => contract.projectId === selectedProject.id && contract.status === '進行中'
      )

      if (relatedContracts.length > 0) {
        // 更新相關合約狀態
        const updatedContracts = savedContracts.map((contract: Contract) => {
          if (contract.projectId === selectedProject.id && contract.status === '進行中') {
            return { ...contract, status: '已終止' }
          }
          return contract
        })
        localStorage.setItem('contracts', JSON.stringify(updatedContracts))

        // 為每個相關合約發送通知
        const timestamp = new Date().toISOString()
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
        const newNotifications = relatedContracts.map((contract: Contract) => ({
          id: `notification_${Date.now()}_${contract.id}`,
          type: 'contract_complete',
          title: '合約狀態更新通知',
          message: `由於項目 ${selectedProject.name} 已取消，相關合約 ${contract.contractNo} 已自動終止`,
          targetId: contract.id,
          targetType: 'contract',
          isRead: false,
          createdAt: timestamp,
          assignedTo: contract.memberId
        }))

        localStorage.setItem('notifications', JSON.stringify([...notifications, ...newNotifications]))
        toast.error(`已自動終止 ${relatedContracts.length} 份相關合約`)
      }
    }

    const updatedProjects = projects.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    )

    setProjects(updatedProjects)
    setSelectedProject(updatedProject)
    localStorage.setItem('projects', JSON.stringify(updatedProjects))
    toast.success('項目狀態已更新')
  }

  const filteredProjects = projects.filter(project =>
    project.projectNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 檢查是否為管理員
  const checkIsAdmin = () => {
    return session?.user?.email === 'admin@example.com' || session?.user?.role === 'admin'
  }

  // 在專案詳情頁面中添加投資人列表區塊
  const InvestorList = ({ projectId }: { projectId: string }) => {
    const [contracts, setContracts] = useState<Contract[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [projectCurrency, setProjectCurrency] = useState<'TWD' | 'USD'>('TWD')

    useEffect(() => {
      // 載入合約、會員和項目資料
      const storedContracts = JSON.parse(localStorage.getItem('contracts') || '[]')
      const storedMembers = JSON.parse(localStorage.getItem('members') || '[]')
      const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]')
      const currentProject = storedProjects.find((p: Project) => p.id === projectId)
      
      setContracts(storedContracts)
      setMembers(storedMembers)
      if (currentProject) {
        setProjectCurrency(currentProject.currency)
      }
    }, [projectId])

    // 過濾出該專案的所有合約
    const projectContracts = contracts.filter(contract => contract.projectId === projectId)

    // 整理投資人資料
    const investors = projectContracts.map(contract => {
      const member = members.find(m => m.id === contract.memberId)
      return {
        ...contract,
        memberName: member?.name || contract.memberName,
        memberStatus: member?.status || '一般會員',
        memberPhone: member?.phone || '',
        memberEmail: member?.email || ''
      }
    })

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          投資人列表
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>會員編號</TableCell>
                <TableCell>姓名</TableCell>
                <TableCell>投資金額</TableCell>
                <TableCell>合約狀態</TableCell>
                <TableCell>簽約日期</TableCell>
                <TableCell>聯絡方式</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investors.map((investor) => (
                <TableRow key={investor.id}>
                  <TableCell>{investor.memberNo}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {investor.memberName}
                      <Chip 
                        label={investor.memberStatus}
                        size="small"
                        color={
                          investor.memberStatus === 'VIP會員' ? 'primary' :
                          investor.memberStatus === '天使會員' ? 'secondary' :
                          'default'
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatAmount(investor.amount, projectCurrency)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={investor.status}
                      size="small"
                      color={
                        investor.status === '已完成' ? 'success' :
                        investor.status === '進行中' ? 'primary' :
                        investor.status === '已終止' ? 'error' :
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(investor.signDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{investor.memberPhone}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {investor.memberEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => router.push(`/contracts?id=${investor.id}`)}
                    >
                      查看合約
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    )
  }

  // 修改金額顯示的部分
  const formatAmount = (amount: number, currency: 'TWD' | 'USD') => {
    // 確保幣別一定有值，預設使用 TWD
    const currencyCode = currency || 'TWD'
    try {
      const formatter = new Intl.NumberFormat(currencyCode === 'TWD' ? 'zh-TW' : 'en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
      let result = formatter.format(amount)
      // 針對不同幣別的特別處理
      if (currencyCode === 'USD') {
        result = result.replace('$', 'US$')
      } else if (currencyCode === 'TWD') {
        result = result.replace('$', 'NT$')
      }
      return result
    } catch (error) {
      // 如果格式化失敗，返回基本格式
      return `${currencyCode === 'TWD' ? 'NT$' : 'US$'}${amount.toLocaleString()}`
    }
  }

  return (
    <Box>
      <Toaster position="top-right" />
      <TopNavbar 
        onAvatarClick={() => setIsRightSidebarOpen(true)}
        pageTitle="項目管理"
      />
      <RightSidebar 
        open={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#F7F9FC',
          minHeight: '100vh',
          pt: '64px'
        }}
      >
        <Box sx={{ py: 3 }}>
          <Container maxWidth="lg">
            {/* 頁面標題 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3 
            }}>
              <Box>
                <Typography variant="h5" sx={{ color: 'grey.900', fontWeight: 600 }}>
                  項目管理
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', mt: 0.5 }}>
                  管理所有投資項目資訊、狀態和相關文件
                </Typography>
              </Box>
            </Box>

            {/* 搜尋和操作區 */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="搜尋項目編號、項目名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        搜尋
                      </Typography>
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => setIsCreateDialogOpen(true)}
                  sx={{
                    height: 40,
                    minWidth: 120,
                    whiteSpace: 'nowrap'
                  }}
                >
                  新增項目
                </Button>
              </Box>
            </Box>

            {/* 項目列表 */}
            <Grid container spacing={2}>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <Grid item xs={12} sm={6} md={3} key={project.id}>
                    <Card sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      }
                    }}>
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {project.projectNo}
                          </Typography>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            {project.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                              label={project.type}
                              size="small"
                              sx={{ bgcolor: '#F3F4F6' }}
                            />
                            <Chip
                              label={project.status}
                              size="small"
                              sx={{ 
                                bgcolor: getStatusColor(project.status).bg,
                                color: getStatusColor(project.status).text
                              }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 0.5 
                          }}>
                            <Typography variant="body2" color="text.secondary">
                              募資進度
                            </Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="medium">
                              {calculateProgress(project.id, project.targetAmount)}%
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            width: '100%', 
                            height: 4, 
                            bgcolor: 'grey.100', 
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${calculateProgress(project.id, project.targetAmount)}%`,
                              height: '100%',
                              bgcolor: 'primary.main',
                              borderRadius: 2,
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            mt: 0.5
                          }}>
                            <Typography variant="caption" color="text.secondary">
                              已募集：{(() => {
                                const savedContracts = JSON.parse(localStorage.getItem('contracts') || '[]')
                                const validContracts = savedContracts.filter(
                                  (contract: Contract) => 
                                    contract.projectId === project.id && 
                                    (contract.status === '進行中' || contract.status === '已完成')
                                )
                                const currentAmount = validContracts.reduce(
                                  (sum: number, contract: Contract) => sum + contract.amount, 
                                  0
                                )
                                return formatAmount(currentAmount, project.currency)
                              })()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              目標：{formatAmount(project.targetAmount, project.currency)}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                目標金額
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatAmount(project.targetAmount, project.currency)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                最低投資
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatAmount(project.minInvestAmount, project.currency)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            募資期間
                          </Typography>
                          <Typography variant="body2">
                            {new Date(project.startDate).toLocaleDateString('zh-TW')} ~ {new Date(project.endDate).toLocaleDateString('zh-TW')}
                          </Typography>
                        </Box>
                      </Box>

                      {/* 項目卡片底部按鈕 */}
                      <Box sx={{ 
                        p: 2, 
                        mt: 'auto',
                        borderTop: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setSelectedProject(project)}
                        >
                          查看詳情
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 8, 
                    textAlign: 'center',
                    color: 'text.secondary',
                    bgcolor: 'white',
                    borderRadius: 2
                  }}>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      尚無項目資料
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      點擊上方的「新增項目」按鈕來建立第一個投資項目
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* 新增項目對話框 */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={() => !isLoading && setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            新增項目
            <IconButton 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isLoading}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="項目名稱"
                value={newProject.name || ''}
                onChange={(e) => setNewProject(prev => ({ 
                  ...prev, 
                  name: e.target.value,
                  projectCode: generateProjectCode(prev.nameEn, e.target.value, prev.countryCode)
                }))}
                required
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="英文名稱"
                value={newProject.nameEn || ''}
                onChange={(e) => setNewProject(prev => ({ 
                  ...prev, 
                  nameEn: e.target.value,
                  projectCode: generateProjectCode(e.target.value, prev.name, prev.countryCode)
                }))}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="國家代碼"
                value={newProject.countryCode || ''}
                onChange={(e) => setNewProject(prev => ({ 
                  ...prev, 
                  countryCode: e.target.value,
                  projectCode: generateProjectCode(prev.nameEn, prev.name, e.target.value)
                }))}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="項目代碼"
                value={newProject.projectCode || ''}
                disabled={true}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>項目類型</InputLabel>
                <Select
                  value={newProject.type || ''}
                  label="項目類型"
                  onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value as Project['type'] }))}
                  disabled={isLoading}
                >
                  <MenuItem value="房地產">房地產</MenuItem>
                  <MenuItem value="股票">股票</MenuItem>
                  <MenuItem value="基金">基金</MenuItem>
                  <MenuItem value="股權投資">股權投資</MenuItem>
                  <MenuItem value="短期投資">短期投資</MenuItem>
                  <MenuItem value="其他">其他</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>幣別</InputLabel>
                <Select
                  value={newProject.currency || 'TWD'}
                  label="幣別"
                  onChange={(e) => setNewProject(prev => ({ ...prev, currency: e.target.value as 'TWD' | 'USD' }))}
                  disabled={isLoading}
                >
                  <MenuItem value="TWD">台幣 (TWD)</MenuItem>
                  <MenuItem value="USD">美金 (USD)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="目標金額"
                type="number"
                value={newProject.targetAmount || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {newProject.currency === 'TWD' ? 'NT$' : 'US$'}
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="最低投資金額"
                type="number"
                value={newProject.minInvestAmount || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, minInvestAmount: Number(e.target.value) }))}
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {newProject.currency === 'TWD' ? 'NT$' : 'US$'}
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="開始日期"
                type="date"
                value={newProject.startDate || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                required
                disabled={isLoading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="結束日期"
                type="date"
                value={newProject.endDate || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                required
                disabled={isLoading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="項目地點"
                value={newProject.location || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, location: e.target.value }))}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="項目說明"
                value={newProject.description || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="投資風險"
                value={newProject.risks || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, risks: e.target.value }))}
                multiline
                rows={3}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="預期報酬"
                value={newProject.returns || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, returns: e.target.value }))}
                multiline
                rows={3}
                disabled={isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                相關文件
              </Typography>
              <input
                type="file"
                id="project-files"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={isLoading}
              />
              <label htmlFor="project-files">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  disabled={isLoading}
                >
                  上傳文件
                </Button>
              </label>
              {selectedFiles.map((file, index) => (
                <Box key={index} sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    {file.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isLoading}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsCreateDialogOpen(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProject}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? '處理中...' : '建立項目'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 項目詳情對話框 */}
      <Dialog 
        open={Boolean(selectedProject)} 
        onClose={() => setSelectedProject(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      項目編號：{selectedProject.projectNo}
                    </Typography>
                    <Typography variant="h6">
                      {selectedProject.name}
                    </Typography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={selectedProject.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as Project['status']
                        if (newStatus === '已取消' && 
                            window.confirm('將項目狀態更改為已取消將會自動終止所有進行中的合約，確定要繼續嗎？')) {
                          const savedContracts = JSON.parse(localStorage.getItem('contracts') || '[]')
                          const relatedContracts = savedContracts.filter(
                            (contract: Contract) => contract.projectId === selectedProject.id && contract.status === '進行中'
                          )

                          if (relatedContracts.length > 0) {
                            // 更新相關合約狀態
                            const updatedContracts = savedContracts.map((contract: Contract) => {
                              if (contract.projectId === selectedProject.id && contract.status === '進行中') {
                                return { ...contract, status: '已終止' }
                              }
                              return contract
                            })
                            localStorage.setItem('contracts', JSON.stringify(updatedContracts))

                            // 為每個相關合約發送通知
                            const timestamp = new Date().toISOString()
                            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
                            const newNotifications = relatedContracts.map((contract: Contract) => ({
                              id: `notification_${Date.now()}_${contract.id}`,
                              type: 'contract_complete',
                              title: '合約狀態更新通知',
                              message: `由於項目 ${selectedProject.name} 已取消，相關合約 ${contract.contractNo} 已自動終止`,
                              targetId: contract.id,
                              targetType: 'contract',
                              isRead: false,
                              createdAt: timestamp,
                              assignedTo: contract.memberId
                            }))

                            localStorage.setItem('notifications', JSON.stringify([...notifications, ...newNotifications]))
                            toast.error(`已自動終止 ${relatedContracts.length} 份相關合約`)
                          }
                        }
                        handleStatusChange(newStatus)
                      }}
                      sx={{ height: 32 }}
                    >
                      <MenuItem value="籌備中">籌備中</MenuItem>
                      <MenuItem value="募資中">募資中</MenuItem>
                      <MenuItem value="執行中">執行中</MenuItem>
                      <MenuItem value="已結束">已結束</MenuItem>
                      <MenuItem value="已取消">已取消</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {checkIsAdmin() && (
                    <Button
                      color="error"
                      onClick={() => {
                        if (window.confirm('確定要刪除此項目嗎？此操作無法復原。')) {
                          const updatedProjects = projects.filter(p => p.id !== selectedProject.id)
                          setProjects(updatedProjects)
                          localStorage.setItem('projects', JSON.stringify(updatedProjects))
                          setSelectedProject(null)
                          toast.success('項目已刪除')
                        }
                      }}
                    >
                      刪除項目
                    </Button>
                  )}
                  <IconButton onClick={() => setSelectedProject(null)}>
                    <Close />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    項目代碼
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.projectCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    英文名稱
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.nameEn || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    項目類型
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    國家代碼
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.countryCode || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    目標金額
                  </Typography>
                  <Typography variant="body1">
                    {formatAmount(selectedProject.targetAmount, selectedProject.currency)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    最低投資金額
                  </Typography>
                  <Typography variant="body1">
                    {formatAmount(selectedProject.minInvestAmount, selectedProject.currency)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    開始日期
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProject.startDate).toLocaleDateString('zh-TW')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    結束日期
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProject.endDate).toLocaleDateString('zh-TW')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    項目地點
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.location || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    項目說明
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedProject.description || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    投資風險
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedProject.risks || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    預期報酬
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedProject.returns || '-'}
                  </Typography>
                </Grid>
                {selectedProject.documents.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      相關文件
                    </Typography>
                    {selectedProject.documents.map((doc, index) => (
                      <Link
                        key={index}
                        href={doc.url}
                        target="_blank"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: 'primary.main',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          mb: 0.5,
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        <Description sx={{ fontSize: 16, mr: 0.5 }} />
                        {doc.name}
                      </Link>
                    ))}
                  </Grid>
                )}
                <Grid item xs={12}>
                  <InvestorList projectId={selectedProject.id} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedProject(null)}>
                關閉
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
} 
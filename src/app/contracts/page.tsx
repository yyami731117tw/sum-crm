'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Search, Add, Close, Upload } from '@mui/icons-material'
import { toast, Toaster } from 'react-hot-toast'
import TopNavbar from '@/components/TopNavbar'

// 合約介面定義
interface Contract {
  id: string
  contractNo: string
  projectId: string
  projectName: string
  memberId: string
  memberName: string
  memberNo: string
  amount: number
  currency: 'TWD' | 'USD'
  paymentMethod: '銀行轉帳' | '現金' | '支票' | '其他'
  bankAccount: string
  bank: string
  paymentDate: string
  signDate: string
  startDate: string
  endDate: string
  status: '待審核' | '待付款' | '進行中' | '已完成' | '已終止' | '待退款'
  invoiceInfo: string
  notes: string
  contractFile?: string
  attachments?: Array<{
    name: string
    url: string
  }>
  createdAt: string
  updatedAt: string
}

// 合約日誌介面定義
interface ContractLog {
  id: string
  contractId: string
  action: string
  timestamp: string
  details: string
  operator: string
  changes?: {
    field: string
    oldValue: string | number
    newValue: string | number
  }[]
}

// 專案介面定義
interface Project {
  id: string
  projectCode: string
  name: string
  status: '籌備中' | '募資中' | '執行中' | '已結束' | '已取消'
}

export default function ContractsPage() {
  // 狀態管理
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [contractLogs, setContractLogs] = useState<ContractLog[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  // 載入資料
  useEffect(() => {
    const savedContracts = localStorage.getItem('contracts')
    if (savedContracts) {
      setContracts(JSON.parse(savedContracts))
    }

    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }

    const savedLogs = localStorage.getItem('contractLogs')
    if (savedLogs) {
      setContractLogs(JSON.parse(savedLogs))
    }
  }, [])

  // 輔助函數
  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case '進行中':
        return { bg: '#DEF7EC', text: '#046C4E' }
      case '已完成':
        return { bg: '#E1EFFE', text: '#1E429F' }
      case '已終止':
        return { bg: '#FDE8E8', text: '#9B1C1C' }
      case '待審核':
        return { bg: '#FEF3C7', text: '#92400E' }
      case '待付款':
        return { bg: '#FFFBEB', text: '#F59E0B' }
      case '待退款':
        return { bg: '#FEF2F2', text: '#EF4444' }
      default:
        return { bg: '#F3F4F6', text: '#374151' }
    }
  }

  const formatAmount = (amount: number, currency: 'TWD' | 'USD') => {
    const formattedAmount = new Intl.NumberFormat().format(amount)
    return currency === 'TWD' ? `NT$${formattedAmount}` : `US$${formattedAmount}`
  }

  // 篩選合約
  const filteredContracts = contracts.filter(contract => 
    contract.contractNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <Box>
      <Toaster position="top-right" />
      <TopNavbar 
        onAvatarClick={() => {}}
        pageTitle="合約管理"
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
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* 頁面標題 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Box>
              <Typography variant="h5" sx={{ color: 'grey.900', fontWeight: 600 }}>
                合約管理
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600', mt: 0.5 }}>
                管理所有合約資訊、狀態和相關文件
              </Typography>
            </Box>
          </Box>

          {/* 搜尋和操作區 */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="搜尋合約..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setSelectedContract({
                id: '',
                contractNo: '',
                projectId: '',
                projectName: '',
                memberId: '',
                memberName: '',
                memberNo: '',
                amount: 0,
                currency: 'TWD',
                paymentMethod: '銀行轉帳',
                bankAccount: '',
                bank: '',
                paymentDate: '',
                signDate: '',
                startDate: '',
                endDate: '',
                status: '待審核',
                invoiceInfo: '',
                notes: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              } as Contract)}
              sx={{ 
                height: 40,
                minWidth: 120,
                whiteSpace: 'nowrap'
              }}
            >
              新增合約
            </Button>
          </Box>

          {/* 合約列表 */}
          <Card sx={{ 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 1000, p: 2 }}>
                <Grid container spacing={2}>
                  {filteredContracts.map((contract) => (
                    <Grid item xs={12} key={contract.id}>
                      <Card
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          },
                        }}
                        onClick={() => setSelectedContract(contract)}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3}>
                            <Typography variant="subtitle2" color="grey.600">
                              合約編號
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {contract.contractNo}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="subtitle2" color="grey.600">
                              專案名稱
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {contract.projectName}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="subtitle2" color="grey.600">
                              會員
                            </Typography>
                            <Typography variant="body1">
                              {contract.memberName}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="subtitle2" color="grey.600">
                              金額
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {contract.currency === 'TWD' ? 'NT$' : 'US$'}{new Intl.NumberFormat().format(contract.amount)}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Box sx={{ 
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              ...getStatusColor(contract.status)
                            }}>
                              <Typography variant="body2">
                                {contract.status}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* 合約編輯抽屜 */}
      <Drawer
        anchor="right"
        open={!!selectedContract}
        onClose={() => setSelectedContract(null)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: 600,
            boxSizing: 'border-box',
            p: 3
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {selectedContract?.id ? '編輯合約' : '新增合約'}
            </Typography>
            <IconButton onClick={() => setSelectedContract(null)}>
              <Close />
            </IconButton>
          </Box>

          {selectedContract && (
            <Box component="form" sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="合約編號"
                    value={selectedContract.contractNo}
                    onChange={(e) => setSelectedContract({
                      ...selectedContract,
                      contractNo: e.target.value
                    })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>專案</InputLabel>
                    <Select
                      value={selectedContract.projectId}
                      onChange={(e) => {
                        const project = projects.find(p => p.id === e.target.value)
                        setSelectedContract({
                          ...selectedContract,
                          projectId: e.target.value,
                          projectName: project?.name || ''
                        })
                      }}
                    >
                      {projects.map((project) => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="金額"
                    type="number"
                    value={selectedContract.amount}
                    onChange={(e) => setSelectedContract({
                      ...selectedContract,
                      amount: Number(e.target.value)
                    })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>幣別</InputLabel>
                    <Select
                      value={selectedContract.currency}
                      onChange={(e) => setSelectedContract({
                        ...selectedContract,
                        currency: e.target.value as 'TWD' | 'USD'
                      })}
                    >
                      <MenuItem value="TWD">TWD</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>付款方式</InputLabel>
                    <Select
                      value={selectedContract.paymentMethod}
                      onChange={(e) => setSelectedContract({
                        ...selectedContract,
                        paymentMethod: e.target.value as Contract['paymentMethod']
                      })}
                    >
                      <MenuItem value="銀行轉帳">銀行轉帳</MenuItem>
                      <MenuItem value="現金">現金</MenuItem>
                      <MenuItem value="支票">支票</MenuItem>
                      <MenuItem value="其他">其他</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {selectedContract.paymentMethod === '銀行轉帳' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="銀行"
                        value={selectedContract.bank}
                        onChange={(e) => setSelectedContract({
                          ...selectedContract,
                          bank: e.target.value
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="帳號"
                        value={selectedContract.bankAccount}
                        onChange={(e) => setSelectedContract({
                          ...selectedContract,
                          bankAccount: e.target.value
                        })}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="簽約日期"
                    type="date"
                    value={selectedContract.signDate}
                    onChange={(e) => setSelectedContract({
                      ...selectedContract,
                      signDate: e.target.value
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="付款日期"
                    type="date"
                    value={selectedContract.paymentDate}
                    onChange={(e) => setSelectedContract({
                      ...selectedContract,
                      paymentDate: e.target.value
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="開始日期"
                    type="date"
                    value={selectedContract.startDate}
                    onChange={(e) => setSelectedContract({
                      ...selectedContract,
                      startDate: e.target.value
                    })}
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
                    value={selectedContract.endDate}
                    onChange={(e) => setSelectedContract({
                      ...selectedContract,
                      endDate: e.target.value
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>狀態</InputLabel>
                    <Select
                      value={selectedContract.status}
                      onChange={(e) => setSelectedContract({
                        ...selectedContract,
                        status: e.target.value as Contract['status']
                      })}
                    >
                      <MenuItem value="待審核">待審核</MenuItem>
                      <MenuItem value="待付款">待付款</MenuItem>
                      <MenuItem value="進行中">進行中</MenuItem>
                      <MenuItem value="已完成">已完成</MenuItem>
                      <MenuItem value="已終止">已終止</MenuItem>
                      <MenuItem value="待退款">待退款</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="發票資訊"
                    multiline
                    rows={2}
                    value={selectedContract.invoiceInfo}
                    onChange={(e) => setSelectedContract({
                      ...selectedContract,
                      invoiceInfo: e.target.value
                    })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="備註"
                    multiline
                    rows={3}
                    value={selectedContract.notes}
                    onChange={(e) => setSelectedContract({
                      ...selectedContract,
                      notes: e.target.value
                    })}
                  />
                </Grid>

                {/* 合約文件上傳區域 */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    合約文件
                  </Typography>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'grey.50'
                      }
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // 在實際應用中，這裡應該上傳到伺服器
                          // 這裡僅示範本地儲存
                          const reader = new FileReader()
                          reader.onload = () => {
                            setSelectedContract({
                              ...selectedContract,
                              contractFile: file.name,
                              attachments: [
                                ...(selectedContract.attachments || []),
                                {
                                  name: file.name,
                                  url: URL.createObjectURL(file)
                                }
                              ]
                            })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    <Upload sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                    <Typography>
                      點擊或拖曳檔案至此處上傳
                    </Typography>
                    <Typography variant="caption" color="grey.600">
                      支援的檔案格式：PDF、DOC、DOCX
                    </Typography>
                  </Box>
                </Grid>

                {/* 已上傳文件列表 */}
                {selectedContract.attachments && selectedContract.attachments.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      已上傳文件
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedContract.attachments.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            borderRadius: 1
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{file.name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              onClick={() => window.open(file.url)}
                            >
                              查看
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedContract({
                                  ...selectedContract,
                                  attachments: selectedContract.attachments?.filter((_, i) => i !== index)
                                })
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* 合約日誌 */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    合約日誌
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {contractLogs
                      .filter(log => log.contractId === selectedContract.id)
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((log) => (
                        <Box
                          key={log.id}
                          sx={{
                            p: 1.5,
                            mb: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            borderRadius: 1,
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="subtitle2" color="primary">
                              {log.action}
                            </Typography>
                            <Typography variant="caption" color="grey.600">
                              {new Date(log.timestamp).toLocaleString('zh-TW')}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="grey.700">
                            {log.details}
                          </Typography>
                          <Typography variant="caption" color="grey.600">
                            操作者：{log.operator}
                          </Typography>
                          {log.changes && log.changes.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {log.changes.map((change, index) => (
                                <Typography key={index} variant="caption" display="block" color="grey.600">
                                  {change.field}：{change.oldValue} → {change.newValue}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedContract(null)}
                >
                  取消
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    const isNew = !selectedContract.id
                    const updatedContract = {
                      ...selectedContract,
                      id: isNew ? crypto.randomUUID() : selectedContract.id,
                      updatedAt: new Date().toISOString()
                    }

                    const updatedContracts = isNew
                      ? [...contracts, updatedContract]
                      : contracts.map(c => c.id === updatedContract.id ? updatedContract : c)

                    setContracts(updatedContracts)
                    localStorage.setItem('contracts', JSON.stringify(updatedContracts))

                    // 記錄操作日誌
                    const newLog: ContractLog = {
                      id: crypto.randomUUID(),
                      contractId: updatedContract.id,
                      action: isNew ? '新增合約' : '更新合約',
                      timestamp: new Date().toISOString(),
                      details: isNew ? '新增合約資料' : '更新合約資料',
                      operator: session?.user?.name || '系統'
                    }

                    const updatedLogs = [...contractLogs, newLog]
                    setContractLogs(updatedLogs)
                    localStorage.setItem('contractLogs', JSON.stringify(updatedLogs))

                    setSelectedContract(null)
                    toast.success(isNew ? '合約新增成功' : '合約更新成功')
                  }}
                >
                  儲存
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  )
} 
export interface Staff {
  id: string
  name: string
  role: '管理員' | '客服人員'
  email: string
  status: 'active' | 'inactive'
}

// 模擬人員資料
export const mockStaffs: Staff[] = [
  {
    id: 'staff_001',
    name: '王主管',
    role: '管理員',
    email: 'wang@example.com',
    status: 'active'
  },
  {
    id: 'staff_002',
    name: '李小姐',
    role: '客服人員',
    email: 'lee@example.com',
    status: 'active'
  },
  {
    id: 'staff_003',
    name: '張小姐',
    role: '客服人員',
    email: 'chang@example.com',
    status: 'active'
  }
] 
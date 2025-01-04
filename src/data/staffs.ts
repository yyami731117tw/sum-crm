export interface Staff {
  id: string
  name: string
  position: string
  email: string
  phone: string
  status: 'active' | 'inactive'
}

export const mockStaffs: Staff[] = [
  {
    id: '1',
    name: '張經理',
    position: '業務經理',
    email: 'chang@example.com',
    phone: '0912-345-678',
    status: 'active'
  },
  {
    id: '2',
    name: '李專員',
    position: '業務專員',
    email: 'lee@example.com',
    phone: '0923-456-789',
    status: 'active'
  },
  {
    id: '3',
    name: '王助理',
    position: '行政助理',
    email: 'wang@example.com',
    phone: '0934-567-890',
    status: 'active'
  }
] 
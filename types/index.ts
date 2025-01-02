export type MemberWithRelations = Member & {
  relatedMembers: RelatedMember[]
  investments: Investment[]
  logs: MemberLog[]
}

export type MemberLog = {
  id: string
  memberId: string
  action: string
  details: string
  operator: string
  changes?: any
  createdAt: Date
}

export type Member = {
  id: string
  memberNo: string
  name: string
  nickname?: string
  gender: string
  phone: string
  email?: string
  birthday: Date
  age?: number
  address?: string
  idNumber: string
  idCardFront?: string
  idCardBack?: string
  status: 'active' | 'inactive'
  memberType: string
  membershipStartDate?: Date
  membershipEndDate?: Date
  remainingDays?: number
  occupation?: string
  lineId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type RelatedMember = {
  id: string
  memberId: string
  relatedMemberId: string
  relationship: string
  createdAt: Date
  updatedAt: Date
}

export type Investment = {
  id: string
  memberId: string
  amount: number
  type: string
  status: string
  date: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
} 
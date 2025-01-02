export interface Member {
  id: string
  memberNo: string
  name: string
  nickname?: string
  gender: string
  phone: string
  email?: string
  birthday: Date
  age: number
  address?: string
  idNumber: string
  idCardFront?: string
  idCardBack?: string
  status: 'active' | 'inactive'
  memberType: string
  membershipStartDate?: Date
  membershipEndDate?: Date
  remainingDays?: number
  hasMembershipPeriod?: boolean
  occupation?: string
  lineId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface RelatedMember {
  id: string
  memberId: string
  name: string
  relationship: string
  phone: string
  notes?: string
  isReferrer?: boolean
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface MemberLog {
  id: string
  memberId: string
  action: string
  details?: string
  changes?: Record<string, { oldValue: any; newValue: any }>
  operator: string
  createdAt: Date
}

export interface Investment {
  id: string
  memberId: string
  name: string
  amount: number
  date: Date
  status: string
}

export interface MemberWithRelations extends Member {
  relatedMembers: RelatedMember[]
  emergencyContact?: EmergencyContact
  logs: MemberLog[]
  investments?: Investment[]
} 
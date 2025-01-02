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
  referrer?: string
  vipStartDate?: Date
  vipEndDate?: Date
  familyStatus?: string
  education?: '高中以下' | '高中職' | '專科' | '大學' | '碩士' | '博士'
  expertise?: string[]
  taboos?: string[]
  nationality?: '台灣 Taiwan' | '馬來西亞 Malaysia' | '中國 China' | '香港 Hong Kong' | '澳洲 Australia' | '日本 Japan'
  isUSCitizen?: boolean
  dietaryHabits?: string
  joinDate?: Date
  joinCondition?: '舊會員' | '會員體驗' | '200萬財力審查'
  createdAt: Date
  updatedAt: Date
}

export interface RelatedMember {
  id: string
  memberId: string
  relatedMemberId: string
  relationship: string
  createdAt: Date
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
  referrer?: string
} 
import { Prisma } from '@prisma/client'

export type MemberWithRelations = Prisma.MemberGetPayload<{
  include: {
    relatedMembers: true
    investments: true
    logs: true
  }
}> 
export const config = {
  cacheKeys: {
    members: 'members-cache',
    memberLogs: 'member-logs-cache',
    contracts: 'contracts-cache',
    users: 'users-cache'
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  }
} 
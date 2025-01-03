export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
  cacheTimeout: 5 * 60 * 1000, // 5 分鐘快取時間
  cacheKeys: {
    members: 'members_cache',
    memberLogs: 'member_logs_cache'
  }
} 
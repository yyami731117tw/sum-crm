// 定義所有組件和頁面的路徑
export const PATHS = {
  components: {
    dashboard: {
      DashboardNav: '@/components/dashboard/DashboardNav',
    },
  },
  hooks: {
    useMembersApi: '@/hooks/useMembersApi',
    useRealtimeMembers: '@/hooks/useRealtimeMembers',
    useMembersCache: '@/hooks/useMembersCache',
    useAuth: '@/hooks/useAuth',
  },
  utils: {
    config: '@/utils/config',
  },
  pages: {
    admin: {
      members: '/admin/members',
      users: '/admin/users',
    },
    dashboard: '/dashboard',
    profile: '/profile',
    contracts: '/contracts',
    projects: '/projects',
  },
} 
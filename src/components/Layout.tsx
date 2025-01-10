import { ReactNode } from 'react'
import { Box } from '@mui/material'
import { DashboardNav } from './dashboard/DashboardNav'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardNav />
      <Box component="main" sx={{ pt: 8 }}>
        {children}
      </Box>
    </Box>
  )
} 
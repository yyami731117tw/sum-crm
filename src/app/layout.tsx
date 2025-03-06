import { Metadata } from 'next'
import { Providers } from './providers'
import { NotificationProvider } from '@/contexts/NotificationContext'
import NotificationDrawer from '@/components/NotificationDrawer'

export const metadata: Metadata = {
  title: 'CRM系統',
  description: '客戶關係管理系統',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          <NotificationProvider>
            {children}
            <NotificationDrawer />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  )
} 
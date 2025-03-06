import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登入 | CRM系統',
  description: 'CRM系統登入頁面',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
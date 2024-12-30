import { ReactNode } from 'react'
import Head from 'next/head'

interface MainLayoutProps {
  children: ReactNode
  title?: string
}

export default function MainLayout({ children, title = 'CRM Dashboard' }: MainLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="B2B CRM Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="layout">
        {/* 這裡添加導航欄、側邊欄等 */}
        <main>{children}</main>
      </div>
    </>
  )
} 
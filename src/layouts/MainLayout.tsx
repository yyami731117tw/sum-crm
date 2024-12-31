import type { FC, ReactNode } from 'react'
import Head from 'next/head'

interface MainLayoutProps {
  children: ReactNode
  title?: string
}

export const MainLayout: FC<MainLayoutProps> = ({
  children,
  title = 'B2B CRM'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </>
  )
} 
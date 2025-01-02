import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import MemberDetail from '@/components/members/MemberDetail'

const MemberDetailPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = router.query
  const [member, setMember] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (id) {
      fetchMember()
    }
  }, [id])

  const fetchMember = async () => {
    try {
      const response = await fetch(`/api/members/${id}`)
      if (!response.ok) {
        throw new Error('找不到會員')
      }
      const data = await response.json()
      setMember(data)
    } catch (error) {
      console.error('載入會員資料失敗:', error)
      router.push('/admin/members')
    }
  }

  if (loading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{member.name} - 會員詳細資料 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <DashboardNav />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold leading-tight text-gray-900">
                  會員詳細資料
                </h1>
              </div>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <MemberDetail
                  member={member}
                  onUpdate={(updatedMember) => setMember(updatedMember)}
                  isFullPage={true}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default MemberDetailPage 
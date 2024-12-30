import type { NextPage } from 'next'
import MainLayout from '@/layouts/MainLayout'

const Home: NextPage = () => {
  return (
    <MainLayout title="首頁 - B2B CRM">
      <div className="container">
        <h1>歡迎使用 B2B CRM 平台</h1>
        {/* 這裡添加您的首頁內容 */}
      </div>
    </MainLayout>
  )
}

export default Home 
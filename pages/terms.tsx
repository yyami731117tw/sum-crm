import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const Terms: NextPage = () => {
  return (
    <>
      <Head>
        <title>使用條款 - MBC天使俱樂部管理系統</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">使用條款</h1>
            
            <div className="prose prose-blue max-w-none">
              <h2>1. 使用範圍</h2>
              <p>本系統（以下簡稱「本系統」）為 MBC天使俱樂部內部會員管理系統，僅供公司授權之客服人員使用。使用本系統即表示您同意遵守以下條款。</p>

              <h2>2. 使用資格</h2>
              <p>2.1 本系統僅供 MBC天使俱樂部正式任用之客服人員使用。</p>
              <p>2.2 使用者需經主管授權並完成系統使用培訓後，方可取得系統使用權限。</p>
              <p>2.3 公司保留審核、停用或撤銷使用權限的權利。</p>

              <h2>3. 資料安全責任</h2>
              <p>3.1 使用者必須妥善保管系統帳號密碼，不得與他人共用或轉讓。</p>
              <p>3.2 使用者須對其帳號下的所有操作負完全責任。</p>
              <p>3.3 嚴禁將系統資料攜出或用於非工作目的。</p>

              <h2>4. 保密義務</h2>
              <p>4.1 使用者對於系統中的所有會員資料及公司機密資訊負有保密義務。</p>
              <p>4.2 未經授權，不得向任何第三方透露系統資料。</p>
              <p>4.3 離職後仍需遵守保密義務。</p>

              <h2>5. 系統使用規範</h2>
              <p>5.1 使用者應遵循公司的資料處理準則及作業流程。</p>
              <p>5.2 禁止任何可能危害系統安全的行為。</p>
              <p>5.3 使用者應定期參與系統操作培訓及資安教育。</p>

              <h2>6. 資料處理原則</h2>
              <p>6.1 處理會員資料時應遵守個人資料保護法相關規定。</p>
              <p>6.2 僅能在工作所需範圍內查詢及處理會員資料。</p>
              <p>6.3 應確保資料的正確性及即時更新。</p>

              <h2>7. 系統監控</h2>
              <p>7.1 公司有權監控系統使用情況，包括登入記錄和操作軌跡。</p>
              <p>7.2 定期進行系統稽核，確保合規使用。</p>

              <h2>8. 違規處理</h2>
              <p>8.1 違反本條款可能導致使用權限暫停或撤銷。</p>
              <p>8.2 嚴重違規者將依公司規定處理，必要時將採取法律行動。</p>

              <h2>9. 工作交接</h2>
              <p>9.1 人員異動時，應確實完成系統使用權限及相關工作之交接。</p>
              <p>9.2 離職時應立即停止使用系統，並交還所有相關資料。</p>

              <h2>10. 條款修改</h2>
              <p>10.1 公司保留隨時修改本條款的權利。</p>
              <p>10.2 條款修改後將通知所有使用者，繼續使用本系統即表示同意修改後的條款。</p>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  最後更新日期：2024年1月1日
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <Link 
                href="/signup"
                className="text-blue-600 hover:text-blue-500"
              >
                返回註冊
              </Link>
              <Link 
                href="/login"
                className="text-blue-600 hover:text-blue-500"
              >
                返回登入
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Terms 
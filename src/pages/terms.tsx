import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

const Terms: NextPage = () => {
  return (
    <>
      <Head>
        <title>使用條款 - 多元商會員管理系統</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* 頂部導航 */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Image
                    src="/logo.png"
                    alt="多元商 Logo"
                    width={40}
                    height={40}
                    className="h-8 w-auto"
                  />
                  <span className="ml-2 text-xl font-semibold text-gray-900">多元商</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  登入
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* 頁面標題 */}
            <div className="px-6 py-8 border-b border-gray-200 bg-gray-50">
              <h1 className="text-3xl font-bold text-gray-900">使用條款</h1>
              <p className="mt-2 text-sm text-gray-600">
                最後更新日期：2024年1月1日
              </p>
            </div>
            
            <div className="px-6 py-8">
              <div className="prose prose-blue max-w-none">
                <div className="space-y-8">
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">1. 使用範圍</h2>
                    <p className="mt-4 text-gray-600">
                      本系統（以下簡稱「本系統」）為多元商內部會員管理系統，僅供公司授權之客服人員使用。使用本系統即表示您同意遵守以下條款。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">2. 使用資格</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>2.1 本系統僅供多元商正式任用之客服人員使用。</p>
                      <p>2.2 使用者需經主管授權並完成系統使用培訓後，方可取得系統使用權限。</p>
                      <p>2.3 公司保留審核、停用或撤銷使用權限的權利。</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">3. 資料安全責任</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>3.1 使用者必須妥善保管系統帳號密碼，不得與他人共用或轉讓。</p>
                      <p>3.2 使用者須對其帳號下的所有操作負完全責任。</p>
                      <p>3.3 嚴禁將系統資料攜出或用於非工作目的。</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">4. 保密義務</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>4.1 使用者對於系統中的所有會員資料及公司機密資訊負有保密義務。</p>
                      <p>4.2 未經授權，不得向任何第三方透露系統資料。</p>
                      <p>4.3 離職後仍需遵守保密義務。</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">5. 系統使用規範</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>5.1 使用者應遵循公司的資料處理準則及作業流程。</p>
                      <p>5.2 禁止任何可能危害系統安全的行為。</p>
                      <p>5.3 使用者應定期參與系統操作培訓及資安教育。</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">6. 資料處理原則</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>6.1 處理會員資料時應遵守個人資料保護法相關規定。</p>
                      <p>6.2 僅能在工作所需範圍內查詢及處理會員資料。</p>
                      <p>6.3 應確保資料的正確性及即時更新。</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">7. 系統監控</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>7.1 公司有權監控系統使用情況，包括登入記錄和操作軌跡。</p>
                      <p>7.2 定期進行系統稽核，確保合規使用。</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">8. 違規處理</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>8.1 違反本條款可能導致使用權限暫停或撤銷。</p>
                      <p>8.2 嚴重違規者將依公司規定處理，必要時將採取法律行動。</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">9. 工作交接</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>9.1 人員異動時，應確實完成系統使用權限及相關工作之交接。</p>
                      <p>9.2 離職時應立即停止使用系統，並交還所有相關資料。</p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">10. 條款修改</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>10.1 公司保留隨時修改本條款的權利。</p>
                      <p>10.2 條款修改後將通知所有使用者，繼續使用本系統即表示同意修改後的條款。</p>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* 底部導航 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Link 
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-500"
                >
                  隱私保護政策
                </Link>
                <div className="flex space-x-4">
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
        </div>
      </div>
    </>
  )
}

export default Terms 
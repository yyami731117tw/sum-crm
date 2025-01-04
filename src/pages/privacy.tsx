import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

const Privacy: NextPage = () => {
  return (
    <>
      <Head>
        <title>隱私保護政策 - 多元商會員管理系統</title>
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
              <h1 className="text-3xl font-bold text-gray-900">隱私保護政策</h1>
              <p className="mt-2 text-sm text-gray-600">
                最後更新日期：2024年1月1日
              </p>
            </div>
            
            <div className="px-6 py-8">
              <div className="prose prose-blue max-w-none">
                <p className="lead">
                  多元商（以下簡稱「本公司」）重視所有資料的安全性與隱私保護。
                  本政策說明系統使用者在處理會員資料時應遵循的規範及保護措施。
                </p>

                <div className="space-y-8">
                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">1. 資料存取權限</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>系統使用者僅能在工作所需範圍內：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>查看及處理被授權的會員資料</li>
                        <li>執行經授權的系統功能</li>
                        <li>存取工作相關的報表及統計資料</li>
                        <li>處理會員服務相關事務</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">2. 資料使用規範</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>在處理會員資料時，使用者必須：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>遵守個人資料保護法的規定</li>
                        <li>依照公司標準作業流程處理資料</li>
                        <li>確保資料的正確性及完整性</li>
                        <li>及時更新會員資料狀態</li>
                        <li>妥善保存相關作業紀錄</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">3. 資料安全管理</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>3.1 工作站安全：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>離開座位時務必鎖定電腦螢幕</li>
                        <li>禁止在未經授權的裝置上處理會員資料</li>
                        <li>不得安裝未經許可的軟體</li>
                      </ul>
                      <p>3.2 資料保護：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>禁止下載或複製會員資料至個人裝置</li>
                        <li>不得使用個人電子郵件處理會員資料</li>
                        <li>嚴禁對外傳送未經加密的敏感資料</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">4. 保密義務</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>4.1 所有系統使用者都必須簽署保密協議。</p>
                      <p>4.2 保密義務包括但不限於：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>會員個人資料</li>
                        <li>投資相關資訊</li>
                        <li>系統營運資料</li>
                        <li>公司營運機密</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">5. 系統使用紀錄</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>系統會記錄使用者的操作行為，包括：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>登入/登出時間</li>
                        <li>資料查詢紀錄</li>
                        <li>資料修改歷程</li>
                        <li>報表下載紀錄</li>
                        <li>異常操作警示</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">6. 事件通報機制</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>如發生以下情況，須立即通報主管：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>發現資料外洩跡象</li>
                        <li>系統異常或故障</li>
                        <li>帳號遭盜用或濫用</li>
                        <li>收到可疑的系統警示</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">7. 教育訓練</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>7.1 新進人員必須完成：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>個資保護基礎訓練</li>
                        <li>系統操作教育訓練</li>
                        <li>資訊安全認知訓練</li>
                      </ul>
                      <p>7.2 在職人員需定期參加：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>資安意識更新課程</li>
                        <li>個資保護進階課程</li>
                        <li>系統功能更新說明會</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">8. 違規處理</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>8.1 違反本政策將視情節輕重處理：</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>口頭警告</li>
                        <li>書面警告</li>
                        <li>停用系統權限</li>
                        <li>調職或解職</li>
                        <li>依法究辦</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-gray-900">9. 政策更新</h2>
                    <div className="mt-4 text-gray-600 space-y-2">
                      <p>9.1 本政策將定期檢討並視需要更新。</p>
                      <p>9.2 政策更新時將通知所有使用者，並可能要求重新簽署同意書。</p>
                    </div>
                  </section>

                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      如有任何問題，請聯絡資訊安全部門：<br />
                      電子郵件：security@mbc.com<br />
                      分機：1234
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部導航 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Link 
                  href="/terms"
                  className="text-blue-600 hover:text-blue-500"
                >
                  使用條款
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

export default Privacy 
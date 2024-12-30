import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

// 導入全局樣式
import '../src/styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    // 這裡可以添加全局初始化邏輯
  }, [])

  return (
    <div>
      {/* 這裡可以添加全局佈局組件 */}
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp 
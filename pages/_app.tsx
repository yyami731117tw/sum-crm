import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import Head from 'next/head'
import '../src/styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 這裡可以添加全局初始化邏輯
  }, [])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="B2B CRM Dashboard" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp 
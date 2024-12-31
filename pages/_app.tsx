import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="B2B CRM Dashboard" />
        <title>B2B CRM</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp 
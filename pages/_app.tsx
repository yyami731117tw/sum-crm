import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../src/styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
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
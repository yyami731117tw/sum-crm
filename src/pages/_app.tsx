import type { AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import '../styles/globals.css'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>B2B CRM</title>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp 
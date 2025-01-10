import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { theme } from '@/styles/theme'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Alert, Box, Button, Container, Typography } from '@mui/material'
import React, { useEffect } from 'react'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    console.error('Caught by ErrorBoundary:', error);
  }, [error]);

  return (
    <Container>
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          發生嚴重錯誤
        </Typography>
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error instanceof Error ? error.message : '未知的錯誤'}
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          詳細錯誤訊息：{error instanceof Error ? error.toString() : '無法取得錯誤訊息'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={resetErrorBoundary}
          sx={{ mt: 2 }}
        >
          重新載入頁面
        </Button>
      </Box>
    </Container>
  )
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled client-side error:', event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error: Error, info: React.ErrorInfo) => {
        console.error('Error caught by ErrorBoundary:', error);
        console.error('Component stack:', info.componentStack || '未知的組件堆棧');
      }}
      onReset={() => {
        // 重置應用程式狀態
        window.location.href = '/'
      }}
    >
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
} 
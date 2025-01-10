import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { theme } from '@/styles/theme'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Alert, Box, Button, Container, Typography } from '@mui/material'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Container>
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          發生錯誤
        </Typography>
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error.message}
        </Alert>
        <Button
          variant="contained"
          onClick={resetErrorBoundary}
          sx={{ mt: 2 }}
        >
          重試
        </Button>
      </Box>
    </Container>
  )
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
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
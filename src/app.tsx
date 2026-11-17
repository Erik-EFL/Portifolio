import { CssBaseline } from '@mui/material'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { SrOnly } from '@/components/Skeleton'
import NavMobile from '@/components/Mobile/Navegação.mobile'
import { GlobalStyle } from '@/Styles/global-style'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import { useTheme } from './context/theme.context'
import About from './pages/About/About'
import AdminPage from './pages/Admin/Admin'
import ErrorScreen from './pages/error-page/index'
import Home from './pages/Home/Home'
import Projects from './pages/Projects/Projects'
import Skills from './pages/Skills/Skills'
import { useLanguage } from './store/language.store'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorScreen />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/about',
        element: <About />
      },
      {
        path: '/projects',
        element: <Projects />
      },
      {
        path: '/skills',
        element: <Skills />
      },
      {
        path: '/contacts',
        element: <ErrorScreen />
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminPage />,
    errorElement: <ErrorScreen />
  }
])

function RootLayout() {
  const { switchTheme } = useTheme()
  const { isLoading, error, retry } = useLanguage()

  return (
    <>
      <Header toggleTheme={switchTheme} />
      {isLoading && (
        <SrOnly role='status' aria-live='polite'>
          Loading portfolio content.
        </SrOnly>
      )}
      {error && (
        <p role='alert'>
          Portfolio API unavailable; showing local fallback.{' '}
          {error instanceof Error ? error.message : 'Unknown loading error.'}{' '}
          <button type='button' onClick={() => void retry()}>
            Retry
          </button>
        </p>
      )}
      <Outlet />
      <NavMobile />
      <Footer toggleTheme={switchTheme} />
    </>
  )
}

export function App() {
  const { theme } = useTheme()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyle />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

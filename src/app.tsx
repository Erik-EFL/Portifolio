import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { PageFallback, SrOnly } from '@/components/Skeleton'
import NavMobile from '@/components/Mobile/Navegação.mobile'
import { usePageView } from '@/analytics'
import { GlobalStyle } from '@/Styles/global-style'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import { useTheme } from './context/theme.context'
import ErrorScreen from './pages/error-page/index'
import { useLanguage } from './store/language.store'

/**
 * Uma rota por chunk: sem isso o build saía num único arquivo de 1.1 MB que
 * todo visitante baixava inteiro antes de ver a home — inclusive o Admin, que
 * é a página mais pesada e a menos acessada.
 */
const Home = lazy(() => import('./pages/Home/Home'))
const About = lazy(() => import('./pages/About/About'))
const Projects = lazy(() => import('./pages/Projects/Projects'))
const Skills = lazy(() => import('./pages/Skills/Skills'))
const AdminPage = lazy(() => import('./pages/Admin/Admin'))

const router = createBrowserRouter(
  [
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
  ],
  // No GitHub Pages o site vive em /Portifolio/: sem o basename o router não
  // reconhece "/Portifolio/about" e cai no errorElement. BASE_URL é '/' quando
  // o site está na raiz do domínio.
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' }
)

function RootLayout() {
  const { switchTheme } = useTheme()
  const { isLoading, error, retry } = useLanguage()

  // Conta o acesso aqui, não em cada página: rota nova entra na série sozinha.
  usePageView()

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
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
      <NavMobile />
      <Footer toggleTheme={switchTheme} />
    </>
  )
}

export function App() {
  const { theme } = useTheme()

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Suspense fallback={<PageFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  )
}

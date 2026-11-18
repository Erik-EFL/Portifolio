import type { PropsWithChildren, ReactElement } from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { theme as lightTheme } from '@/Styles/light-theme'

interface IRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Rota inicial quando o componente usa NavLink/useLocation. */
  route?: string
}

/**
 * Sem o ThemeProvider o styled-components entrega um tema vazio e os
 * `theme.semantic.*` estouram na geração do CSS.
 *
 * O QueryClientProvider entra sem retry e sem cache: hooks como `useLanguage`
 * consultam o backend, e em teste não queremos rede nem espera entre tentativas.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', ...options }: IRenderOptions = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } }
  })

  return rtlRender(ui, {
    ...options,
    wrapper: ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  })
}

export { screen, within } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

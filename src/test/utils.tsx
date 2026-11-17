import type { PropsWithChildren, ReactElement } from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { MemoryRouter } from 'react-router-dom'
import { theme as lightTheme } from '@/Styles/light-theme'

interface IRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Rota inicial quando o componente usa NavLink/useLocation. */
  route?: string
}

/**
 * Sem o ThemeProvider o styled-components entrega um tema vazio e os
 * `theme.semantic.*` estouram na geração do CSS.
 */
export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', ...options }: IRenderOptions = {}
) =>
  rtlRender(ui, {
    ...options,
    wrapper: ({ children }: PropsWithChildren) => (
      <MemoryRouter initialEntries={[route]}>
        <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
      </MemoryRouter>
    )
  })

export { screen, within } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

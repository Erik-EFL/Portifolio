import { describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './theme.context'

const Probe = () => {
  const { themeMode, switchTheme } = useTheme()

  return (
    <button type='button' onClick={switchTheme}>
      modo:{themeMode}
    </button>
  )
}

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  )

describe('ThemeProvider', () => {
  it('começa no claro e alterna ao trocar', async () => {
    renderProbe()

    const botao = screen.getByRole('button')
    expect(botao).toHaveTextContent('modo:light')

    await userEvent.click(botao)

    expect(botao).toHaveTextContent('modo:dark')
  })

  it('persiste o modo e reflete no documento', async () => {
    renderProbe()

    await userEvent.click(screen.getByRole('button'))

    expect(window.localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('lê o modo salvo na montagem', () => {
    window.localStorage.setItem('theme', 'dark')

    renderProbe()

    expect(screen.getByRole('button')).toHaveTextContent('modo:dark')
  })

  it('descarta valor legado (objeto do tema) em vez de ficar sem tema', () => {
    window.localStorage.setItem('theme', '{"mode":"dark","colors":{}}')

    renderProbe()

    expect(screen.getByRole('button')).toHaveTextContent('modo:light')
    expect(window.localStorage.getItem('theme')).toBe('light')
  })

  it('aplica data-theme dentro de act, sem warning de update', async () => {
    renderProbe()

    await act(async () => {
      await userEvent.click(screen.getByRole('button'))
    })

    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})

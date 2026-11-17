import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

const Explode = () => {
  throw new Error('falha proposital')
}

describe('ErrorBoundary', () => {
  it('renderiza os filhos quando não há erro', () => {
    render(
      <ErrorBoundary>
        <p>conteúdo normal</p>
      </ErrorBoundary>
    )

    expect(screen.getByText('conteúdo normal')).toBeInTheDocument()
  })

  it('mostra a mensagem de erro em vez de tela em branco', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Explode />
      </ErrorBoundary>
    )

    const alerta = screen.getByRole('alert')
    expect(alerta).toHaveTextContent(/algo deu errado/i)
    expect(alerta).toHaveTextContent('falha proposital')
    expect(consoleError).toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('usa o fallback customizado quando fornecido', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<p>fallback custom</p>}>
        <Explode />
      </ErrorBoundary>
    )

    expect(screen.getByText('fallback custom')).toBeInTheDocument()

    consoleError.mockRestore()
  })
})

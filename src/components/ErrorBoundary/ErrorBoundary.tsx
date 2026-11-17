import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface IErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface IErrorBoundaryState {
  error: Error | null
}

const fallbackStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  padding: '1.5rem',
  textAlign: 'center',
  background: '#1e1e1f',
  color: '#fbfbfb',
  fontFamily: "'Segoe UI', system-ui, sans-serif"
}

/**
 * Última linha de defesa: sem isso um erro de render derruba a árvore inteira
 * e o usuário fica com a tela em branco, sem mensagem e sem log.
 *
 * As cores são fixas porque este componente fica FORA dos providers de tema —
 * ele precisa renderizar justamente quando o resto quebrou.
 */
export class ErrorBoundary extends Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  state: IErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      'Erro não tratado na renderização:',
      error,
      info.componentStack
    )
  }

  render(): ReactNode {
    const { error } = this.state
    const { children, fallback } = this.props

    if (!error) return children
    if (fallback) return fallback

    return (
      <main role='alert' style={fallbackStyle}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Algo deu errado</h1>
        <p style={{ margin: 0, maxWidth: '40rem', color: '#aeaeaf' }}>
          A página não pôde ser exibida. Recarregue para tentar de novo.
        </p>
        <code
          style={{
            maxWidth: '40rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            background: '#2e2e2f',
            color: '#fbfbfb',
            fontSize: '0.85rem',
            overflowWrap: 'anywhere'
          }}
        >
          {error.message}
        </code>
        <button
          type='button'
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #4e4e4f',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer'
          }}
        >
          Recarregar
        </button>
      </main>
    )
  }
}

export default ErrorBoundary

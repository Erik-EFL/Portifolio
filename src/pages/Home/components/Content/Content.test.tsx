import { describe, expect, it, vi } from 'vitest'
import Content from './Content'
import { renderWithProviders, screen } from '@/test/utils'

const mockUseLanguage = vi.fn()

vi.mock('@/store/language.store', () => ({
  useLanguage: () => mockUseLanguage()
}))

const home = {
  circle: 'Sou',
  name: 'Erik Ferreira Lima',
  title: 'Desenvolvedor Front-end',
  description: [
    'Transformo ideias em interfaces.',
    'React, TypeScript e Node.'
  ],
  link: 'Sobre o desenvolvedor'
}

const montar = (isLoading = false) => {
  mockUseLanguage.mockReturnValue({
    data: { home },
    language: 'ptBR',
    isLoading
  })

  return renderWithProviders(<Content />)
}

describe('Home / Content', () => {
  it('mostra o badge, o nome e a descrição do conteúdo', () => {
    montar()

    expect(screen.getByText('Sou')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: /Erik Ferreira Lima/ })
    ).toBeInTheDocument()
    expect(screen.getByText('React, TypeScript e Node.')).toBeInTheDocument()
  })

  it('oferece o link para a página sobre', () => {
    montar()

    const link = screen.getByRole('link', { name: 'Sobre o desenvolvedor' })

    expect(link).toHaveAttribute('href', '/about')
    expect(link).toHaveTextContent('Sobre o desenvolvedor')
  })

  it('o nome é o h1 e só o cargo espera o carregamento', () => {
    montar(true)

    // o h1 (nome) existe sempre; o cargo (h2) só depois do conteúdo
    expect(
      screen.getByRole('heading', { level: 1, name: /Erik Ferreira Lima/ })
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})

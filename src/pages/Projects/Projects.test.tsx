import { describe, expect, it, vi } from 'vitest'
import Projects from './Projects'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import type { IProject } from '@/@types/projects.entity'

const mockUseFetchProjects = vi.fn()

vi.mock('./utils/useFetchProjects', () => ({
  default: () => mockUseFetchProjects()
}))

const projeto = (overrides: Partial<IProject> = {}): IProject => ({
  id: 1,
  name: 'AppDelivery',
  description: 'App de entregas',
  html_url: 'https://github.com/Erik-EFL/AppDelivery',
  homepage: null,
  fork: false,
  visibility: 'public',
  language: 'TypeScript',
  ...overrides
})

const montar = (estado: {
  projects?: IProject[]
  isLoading?: boolean
  error?: Error | null
}) => {
  mockUseFetchProjects.mockReturnValue({
    projects: [],
    isLoading: false,
    error: null,
    retry: vi.fn(),
    ...estado
  })

  return renderWithProviders(<Projects />)
}

describe('Projects', () => {
  it('mostra um card por projeto com link do GitHub', () => {
    montar({
      projects: [
        projeto(),
        projeto({
          id: 2,
          name: 'SemHomepage',
          html_url: 'https://github.com/Erik-EFL/x'
        })
      ]
    })

    expect(screen.getByText('AppDelivery')).toBeInTheDocument()
    expect(screen.getByText('SemHomepage')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('mostra o botão Site apenas quando o repositório tem homepage', () => {
    montar({
      projects: [
        projeto({ homepage: 'https://appdelivery.example.com' }),
        projeto({ id: 2, name: 'SemHomepage', homepage: null })
      ]
    })

    expect(screen.getAllByRole('button', { name: 'Site' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Git Hub' })).toHaveLength(2)

    const linkSite = screen
      .getAllByRole('link')
      .find(
        link => link.getAttribute('href') === 'https://appdelivery.example.com'
      )

    expect(linkSite).toBeDefined()
    expect(linkSite).toHaveAttribute('target', '_blank')
    expect(linkSite).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('mostra erro com retry clicável quando a busca falha', async () => {
    const retry = vi.fn()
    mockUseFetchProjects.mockReturnValue({
      projects: [],
      isLoading: false,
      error: new Error('403'),
      retry
    })

    renderWithProviders(<Projects />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os projetos'
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' })
    )

    expect(retry).toHaveBeenCalledTimes(1)
  })

  it('não renderiza cards enquanto carrega', () => {
    montar({ isLoading: true, projects: [projeto()] })

    expect(screen.queryByText('AppDelivery')).not.toBeInTheDocument()
  })
})

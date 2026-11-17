import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useFetchProjects from './useFetchProjects'

const criarWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

const repositorio = (overrides: Record<string, unknown>) => ({
  id: 1,
  name: 'repo',
  description: 'desc',
  html_url: 'https://github.com/Erik-EFL/repo',
  homepage: null,
  fork: false,
  visibility: 'public',
  language: 'TypeScript',
  ...overrides
})

describe('useFetchProjects', () => {
  it('remove forks e repositórios fora do portfólio', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          repositorio({ id: 1, name: 'AppDelivery' }),
          repositorio({ id: 2, name: 'fork-de-alguem', fork: true }),
          repositorio({ id: 3, name: 'projetos' })
        ]
      })
    )

    const { result } = renderHook(() => useFetchProjects(), {
      wrapper: criarWrapper()
    })

    await waitFor(() => expect(result.current.projects).toHaveLength(1))
    expect(result.current.projects[0].name).toBe('AppDelivery')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('expõe erro e para de carregar quando a API do GitHub falha', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 403, json: async () => [] })
    )

    const { result } = renderHook(() => useFetchProjects(), {
      wrapper: criarWrapper()
    })

    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.projects).toEqual([])
  })

  it('trata falha de rede como erro (sem ficar carregando para sempre)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    )

    const { result } = renderHook(() => useFetchProjects(), {
      wrapper: criarWrapper()
    })

    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.isLoading).toBe(false)
  })
})

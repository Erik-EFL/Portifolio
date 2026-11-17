import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLanguage, useLanguageStore } from './language.store'

const getRowsMock = vi.fn()

vi.mock('@/services/admin-api.service', async () => {
  const real = await vi.importActual<
    typeof import('@/services/admin-api.service')
  >('@/services/admin-api.service')

  return {
    ...real,
    getRows: () => getRowsMock()
  }
})

const criarWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } }
  })

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

beforeEach(() => {
  getRowsMock.mockReset()
  useLanguageStore.setState({ language: 'ptBR' })
})

describe('useLanguage', () => {
  it('começa no ptBR e cai no conteúdo estático quando a API falha', async () => {
    getRowsMock.mockRejectedValue(new Error('offline'))

    const { result } = renderHook(() => useLanguage(), {
      wrapper: criarWrapper()
    })

    expect(result.current.language).toBe('ptBR')
    expect(result.current.data.navigation.length).toBeGreaterThan(0)

    await waitFor(() => expect(result.current.error).not.toBeNull())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('mescla as linhas da API por cima do conteúdo estático', async () => {
    getRowsMock.mockResolvedValue([
      {
        _id: 'nav',
        key: 'navigation',
        value: [
          { language: 'ptBR', items: [{ name: 'Início', link: '/' }] },
          { language: 'enUS', items: [{ name: 'Home', link: '/' }] }
        ]
      }
    ])

    const { result } = renderHook(() => useLanguage(), {
      wrapper: criarWrapper()
    })

    await waitFor(() =>
      expect(result.current.data.navigation).toEqual([
        { name: 'Início', link: '/' }
      ])
    )
    // o que a API não mandou continua vindo do fallback
    expect(result.current.data.home.name).toBeTruthy()
  })

  it('resolve o conteúdo no idioma escolhido', async () => {
    getRowsMock.mockResolvedValue([])

    const { result } = renderHook(() => useLanguage(), {
      wrapper: criarWrapper()
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const emPt = result.current.data.navigation.map(item => item.name)

    act(() => {
      result.current.changeLanguage('enUS')
    })

    const emEn = result.current.data.navigation.map(item => item.name)

    expect(emEn).not.toEqual(emPt)
    expect(result.current.language).toBe('enUS')
    expect(localStorage.getItem('language')).toBe('enUS')
  })

  it('expõe retry que refaz a busca', async () => {
    getRowsMock.mockRejectedValue(new Error('offline'))

    const { result } = renderHook(() => useLanguage(), {
      wrapper: criarWrapper()
    })

    await waitFor(() => expect(result.current.error).not.toBeNull())

    getRowsMock.mockResolvedValue([
      { key: 'navigation', value: [{ language: 'ptBR', items: [] }] }
    ])

    act(() => {
      void result.current.retry()
    })

    await waitFor(() => expect(getRowsMock).toHaveBeenCalledTimes(2))
  })
})

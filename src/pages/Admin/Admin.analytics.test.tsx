import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/utils'
import { screen } from '@testing-library/react'
import type { AnalyticsSummary } from '@/analytics'
import { AnalyticsPanel } from './Admin.analytics'

const summary: AnalyticsSummary = {
  generatedAt: '2026-11-17T12:00:00.000Z',
  timeZone: 'America/Sao_Paulo',
  days: Array.from({ length: 30 }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    const views = index === 29 ? 4 : index === 28 ? 2 : 0
    return {
      date: `2026-10-${day}`.replace('2026-10-3', '2026-11-0'),
      views,
      visitors: views > 0 ? 1 : 0,
      paths: { home: views, about: 0, skills: 0, projects: 0 },
      languages: { ptBR: views, enUS: 0 }
    }
  }),
  totals: {
    views: 6,
    visitors: 2,
    days: 30,
    paths: { home: 5, about: 1, skills: 0, projects: 0 },
    languages: { ptBR: 4, enUS: 2 }
  }
}

const mockGetAnalytics = vi.fn()

vi.mock('@/services/admin-api.service', () => ({
  ANALYTICS_QUERY_KEY: ['analytics-summary'],
  getAnalytics: () => mockGetAnalytics()
}))

describe('AnalyticsPanel', () => {
  it('mostra os totais e a origem dos acessos', async () => {
    mockGetAnalytics.mockResolvedValueOnce(summary)
    renderWithProviders(<AnalyticsPanel />)

    expect(await screen.findByText('Acessos ao site')).toBeInTheDocument()
    expect(await screen.findByText('Janela de 30 dias')).toBeInTheDocument()
    // 30 dias, 7 dias e hoje: 6 acessos na janela, 6 nos últimos 7 (só dois dias
    // têm visita) e 4 hoje — o gráfico está nos últimos 30 dias da série.
    expect(screen.getAllByText('6')).toHaveLength(2)
    // "4" também aparece na tabela de rotas; o cartão de hoje é o alvo certo
    expect(screen.getByText('Hoje').closest('article')).toHaveTextContent('4')
    expect(screen.getByText('/skills')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('America/Sao_Paulo')).toBeInTheDocument()
  })

  it('explica o vazio em vez de mostrar gráfico sem dados', async () => {
    mockGetAnalytics.mockResolvedValueOnce({
      ...summary,
      totals: { ...summary.totals, views: 0 },
      days: summary.days.map(day => ({ ...day, views: 0, visitors: 0 }))
    })
    renderWithProviders(<AnalyticsPanel />)

    expect(
      await screen.findByText(/Ainda não há acessos registrados/i, undefined, {
        timeout: 3000
      })
    ).toBeInTheDocument()
    expect(screen.queryByText('De onde vêm os acessos')).not.toBeInTheDocument()
  })

  it('mostra o erro da API sem derrubar o painel', async () => {
    mockGetAnalytics.mockRejectedValueOnce(new Error('Sem token válido'))
    renderWithProviders(<AnalyticsPanel />)

    // retry: 1 no painel: o erro só aparece depois da segunda tentativa
    expect(
      await screen.findByText(
        /Não foi possível carregar os acessos/i,
        undefined,
        { timeout: 6000 }
      )
    ).toBeInTheDocument()
  })
})

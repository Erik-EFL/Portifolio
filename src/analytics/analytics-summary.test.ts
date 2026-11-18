import { describe, expect, it } from 'vitest'
import { parseAnalyticsSummary } from './analytics-summary'

const response = {
  generatedAt: '2026-11-17T12:00:00.000Z',
  timeZone: 'America/Sao_Paulo',
  days: [
    {
      date: '2026-11-16',
      views: 2,
      visitors: 1,
      paths: { home: 2 },
      languages: { ptBR: 2 }
    },
    {
      date: '2026-11-17',
      views: 3,
      visitors: 2,
      paths: { skills: 2, about: 1 },
      languages: { ptBR: 1, enUS: 2 }
    }
  ],
  totals: {
    views: 5,
    visitors: 3,
    days: 30,
    paths: { home: 2, skills: 2, about: 1, projects: 0 },
    languages: { ptBR: 3, enUS: 2 }
  }
}

describe('parseAnalyticsSummary', () => {
  it('lê a série e os totais', () => {
    const summary = parseAnalyticsSummary(response)

    expect(summary.days).toHaveLength(2)
    expect(summary.days[1].date).toBe('2026-11-17')
    expect(summary.totals.views).toBe(5)
    expect(summary.totals.paths.skills).toBe(2)
    expect(summary.totals.languages.enUS).toBe(2)
  })

  it('zera contadores inválidos em vez de renderizar NaN', () => {
    const summary = parseAnalyticsSummary({
      ...response,
      days: [{ date: '2026-11-17', views: 'muitos', visitors: -2 }],
      totals: { ...response.totals, views: null }
    })

    expect(summary.days[0].views).toBe(0)
    expect(summary.days[0].visitors).toBe(0)
    expect(summary.days[0].paths.home).toBe(0)
    expect(summary.totals.views).toBe(0)
  })

  it('recusa resposta sem série ou sem totais', () => {
    expect(() => parseAnalyticsSummary({ days: [] })).toThrow()
    expect(() => parseAnalyticsSummary({ totals: {} })).toThrow()
    expect(() => parseAnalyticsSummary(null)).toThrow()
    expect(() => parseAnalyticsSummary({ days: [{}], totals: {} })).toThrow()
  })
})

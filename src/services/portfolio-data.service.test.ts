import { describe, expect, it } from 'vitest'
import {
  getLocalizedPortfolioData,
  mergePortfolioRows,
  parseDataRows,
  STATIC_PORTFOLIO_DATA
} from './portfolio-data.service'

describe('mergePortfolioRows', () => {
  it('sem linhas da API, devolve o conteúdo estático completo', () => {
    const merged = mergePortfolioRows([])

    expect(merged.navigation).toHaveLength(2)
    expect(merged.home.length).toBeGreaterThan(0)
    expect(merged).toEqual(STATIC_PORTFOLIO_DATA)
  })

  it('substitui apenas a seção enviada pela API', () => {
    const customNavigation = [
      {
        language: 'ptBR' as const,
        items: [{ name: 'Início', link: '/' }]
      }
    ]
    const merged = mergePortfolioRows([
      { key: 'navigation', value: customNavigation }
    ])

    expect(merged.navigation).toEqual(customNavigation)
    expect(merged.home).toEqual(STATIC_PORTFOLIO_DATA.home)
  })
})

describe('getLocalizedPortfolioData', () => {
  it('resolve cada seção no idioma pedido', () => {
    const data = mergePortfolioRows([])
    const pt = getLocalizedPortfolioData(data, 'ptBR')
    const en = getLocalizedPortfolioData(data, 'enUS')

    expect(pt.navigation.map(item => item.link)).toContain('/contact')
    expect(en.navigation.at(-1)?.link).toBe('/contact')
    expect(en.navigation[0].name).not.toBe(pt.navigation[0].name)
  })
})

describe('parseDataRows', () => {
  it('ignora linhas de seções que o app não conhece', () => {
    const rows = parseDataRows([
      { _id: '1', key: 'navigation', value: [] },
      { _id: '2', key: 'secao-inexistente', value: [] }
    ])

    expect(rows).toHaveLength(1)
    expect(rows[0]._id).toBe('1')
  })

  it('aceita o envelope { data: [...] } do appbackend', () => {
    const rows = parseDataRows({ data: [{ key: 'navigation', value: [] }] })

    expect(rows).toHaveLength(1)
  })

  it('falha alto quando a resposta não é uma lista', () => {
    expect(() => parseDataRows({})).toThrow(/must be an array/)
    expect(() => parseDataRows('texto')).toThrow(/must be an array/)
  })

  it('falha alto em linha malformada em vez de entregar dado parcial', () => {
    expect(() => parseDataRows([null])).toThrow(/invalid row at index 0/)
    expect(() => parseDataRows([{ key: 'navigation', value: [] }, 42])).toThrow(
      /invalid row at index 1/
    )
  })
})

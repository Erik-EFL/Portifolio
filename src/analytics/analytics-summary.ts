import type { TLanguage } from '@/@types/portfolio.entity'
import { ANALYTICS_PATHS, type AnalyticsPath } from './page-view'

export interface DailyAnalytics {
  date: string
  views: number
  visitors: number
  paths: Record<AnalyticsPath, number>
  languages: Record<TLanguage, number>
}

export interface AnalyticsTotals {
  views: number
  visitors: number
  paths: Record<AnalyticsPath, number>
  languages: Record<TLanguage, number>
  days: number
}

export interface AnalyticsSummary {
  generatedAt: string
  timeZone: string
  days: DailyAnalytics[]
  totals: AnalyticsTotals
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Contador vindo do servidor: aceita só inteiro ≥ 0, nunca NaN na tela. */
const toCount = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.trunc(value)
    : 0

const toPaths = (value: unknown): Record<AnalyticsPath, number> => {
  const record = isRecord(value) ? value : {}
  return ANALYTICS_PATHS.reduce(
    (counts, path) => ({ ...counts, [path]: toCount(record[path]) }),
    {} as Record<AnalyticsPath, number>
  )
}

const toLanguages = (value: unknown): Record<TLanguage, number> => {
  const record = isRecord(value) ? value : {}
  return { ptBR: toCount(record.ptBR), enUS: toCount(record.enUS) }
}

/**
 * A resposta é validada campo a campo porque a tela soma números: um `views`
 * que virasse string quebraria o gráfico sem mensagem de erro visível.
 */
export const parseAnalyticsSummary = (input: unknown): AnalyticsSummary => {
  if (
    !isRecord(input) ||
    !Array.isArray(input.days) ||
    !isRecord(input.totals)
  ) {
    throw new Error('The analytics API returned an invalid response.')
  }

  const days = input.days.map((day, index) => {
    if (!isRecord(day) || typeof day.date !== 'string') {
      throw new Error(
        `The analytics API returned an invalid day at index ${index}.`
      )
    }

    return {
      date: day.date,
      views: toCount(day.views),
      visitors: toCount(day.visitors),
      paths: toPaths(day.paths),
      languages: toLanguages(day.languages)
    }
  })

  const totals = input.totals

  return {
    generatedAt: typeof input.generatedAt === 'string' ? input.generatedAt : '',
    timeZone: typeof input.timeZone === 'string' ? input.timeZone : '',
    days,
    totals: {
      views: toCount(totals.views),
      visitors: toCount(totals.visitors),
      paths: toPaths(totals.paths),
      languages: toLanguages(totals.languages),
      days: toCount(totals.days)
    }
  }
}

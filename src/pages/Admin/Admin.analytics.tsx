import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  type AnalyticsPath,
  type AnalyticsSummary,
  type DailyAnalytics
} from '@/analytics'
import { ANALYTICS_QUERY_KEY, getAnalytics } from '@/services/admin-api.service'
import { displayError } from '@/utils/display-error'
import styles from './Admin.module.css'
import { ICONS, Icon } from './Admin.icons'

const RANGE_OPTIONS = [7, 30, 90] as const
const PATH_LABELS: Record<AnalyticsPath, string> = {
  home: '/',
  about: '/about',
  skills: '/skills',
  projects: '/projects'
}
const LANGUAGE_LABELS = { ptBR: 'Português', enUS: 'English' } as const

const formatDay = (date: string): string => {
  const [, month, day] = date.split('-')
  return `${day}/${month}`
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('pt-BR').format(value)

const sumWindow = (days: DailyAnalytics[], windowSize: number): number =>
  days.slice(-windowSize).reduce((total, day) => total + day.views, 0)

const Chart = ({ days }: { days: DailyAnalytics[] }) => {
  // A série de 90 dias fica ilegível em barras: o gráfico mostra a cauda.
  const visible = days.slice(-30)
  const peak = Math.max(...visible.map(day => day.views), 0)
  const peakDay = visible.filter(day => day.views === peak).at(-1)

  if (peak === 0) {
    return (
      <p className={styles.notice}>
        Nenhum acesso registrado nesta janela ainda.
      </p>
    )
  }

  return (
    <div
      className={styles.chart}
      role='img'
      aria-label={`Acessos por dia nos últimos ${
        visible.length
      } dias. Pico de ${peak} em ${formatDay(peakDay?.date ?? '')}.`}
    >
      {visible.map(day => (
        <div
          className={styles.chartColumn}
          key={day.date}
          title={`${formatDay(day.date)}: ${day.views} acesso(s), ${
            day.visitors
          } visitante(s)`}
        >
          <span
            className={`${styles.chartBar} ${
              day.views === 0 ? styles.chartBarEmpty : ''
            }`}
            style={{ blockSize: `${Math.max((day.views / peak) * 100, 2)}%` }}
          />
        </div>
      ))}
    </div>
  )
}

const BreakdownTable = ({
  label,
  rows
}: {
  label: string
  rows: Array<{ key: string; title: string; value: number; total: number }>
}) => (
  <div className={styles.tableWrapper}>
    <table className={styles.table}>
      <caption className={styles.tableCaption}>{label}</caption>
      <thead>
        <tr>
          <th scope='col'>Origem</th>
          <th scope='col'>Acessos</th>
          <th scope='col'>Participação</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.key}>
            <td>{row.title}</td>
            <td>{formatNumber(row.value)}</td>
            <td>
              {row.total > 0 ? Math.round((row.value / row.total) * 100) : 0}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const Summary = ({ summary }: { summary: AnalyticsSummary }) => {
  const today = summary.days.at(-1)
  const uniqueLabel =
    'Soma dos visitantes únicos de cada dia. A mesma pessoa em dias diferentes conta mais de uma vez.'

  return (
    <>
      <div className={styles.analyticsGrid}>
        <article className={styles.kpi}>
          <p className={styles.kpiLabel}>Hoje</p>
          <p className={styles.kpiValue}>{formatNumber(today?.views ?? 0)}</p>
          <p className={styles.kpiHint}>
            {formatNumber(today?.visitors ?? 0)} visitante(s)
          </p>
        </article>
        <article className={styles.kpi}>
          <p className={styles.kpiLabel}>Últimos 7 dias</p>
          <p className={styles.kpiValue}>
            {formatNumber(sumWindow(summary.days, 7))}
          </p>
          <p className={styles.kpiHint}>acessos</p>
        </article>
        <article className={styles.kpi}>
          <p className={styles.kpiLabel}>
            Janela de {summary.totals.days} dias
          </p>
          <p className={styles.kpiValue}>
            {formatNumber(summary.totals.views)}
          </p>
          <p className={styles.kpiHint}>acessos</p>
        </article>
        <article className={styles.kpi}>
          <p className={styles.kpiLabel}>Visitantes únicos/dia</p>
          <p className={styles.kpiValue}>
            {formatNumber(summary.totals.visitors)}
          </p>
          <p className={styles.kpiHint}>{uniqueLabel}</p>
        </article>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>
              <Icon
                className={styles.cardTitleIcon}
                path={ICONS.grid}
                size={20}
              />
              Acessos por dia
            </h3>
            <p className={styles.cardSub}>
              Gráfico limitado aos últimos 30 dias; os totais acima somam a
              janela inteira. Dia sem acesso aparece vazio, não ausente.
            </p>
          </div>
          <span className={styles.pill}>
            {summary.timeZone || 'America/Sao_Paulo'}
          </span>
        </div>
        <Chart days={summary.days} />
      </section>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle}>
              <Icon
                className={styles.cardTitleIcon}
                path={ICONS.eye}
                size={20}
              />
              De onde vêm os acessos
            </h3>
            <p className={styles.cardSub}>
              Rotas e idioma no momento do acesso. O painel não é contado.
            </p>
          </div>
        </div>
        <BreakdownTable
          label='Por rota'
          rows={Object.entries(summary.totals.paths).map(([path, value]) => ({
            key: path,
            title: PATH_LABELS[path as AnalyticsPath],
            value,
            total: summary.totals.views
          }))}
        />
        <BreakdownTable
          label='Por idioma'
          rows={Object.entries(summary.totals.languages).map(
            ([language, value]) => ({
              key: language,
              title: LANGUAGE_LABELS[language as keyof typeof LANGUAGE_LABELS],
              value,
              total: summary.totals.views
            })
          )}
        />
      </section>
    </>
  )
}

export const AnalyticsPanel = () => {
  const [days, setDays] = useState<number>(30)
  const analyticsQuery = useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, days],
    queryFn: () => getAnalytics(days),
    retry: 1
  })

  return (
    <>
      <section className={styles.card} aria-labelledby='analytics-title'>
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.cardTitle} id='analytics-title'>
              <Icon
                className={styles.cardTitleIcon}
                path={ICONS.eye}
                size={20}
              />
              Acessos ao site
            </h3>
            <p className={styles.cardSub}>
              Contagem feita pelo próprio site em produção e guardada no
              Firestore. Só o servidor escreve: o navegador do visitante nunca
              toca no banco.
            </p>
          </div>
          <div className={styles.rangeSwitch}>
            {RANGE_OPTIONS.map(option => (
              <button
                key={option}
                className={`${styles.btn} ${
                  days === option ? styles.btnPrimary : styles.btnSubtle
                }`}
                type='button'
                aria-pressed={days === option}
                onClick={() => setDays(option)}
              >
                {option} dias
              </button>
            ))}
            <button
              className={`${styles.btn} ${styles.btnSubtle}`}
              type='button'
              onClick={() => void analyticsQuery.refetch()}
              disabled={analyticsQuery.isFetching}
            >
              <Icon path={ICONS.restore} size={16} />
              {analyticsQuery.isFetching ? 'Atualizando…' : 'Atualizar'}
            </button>
          </div>
        </div>

        <div className={styles.analyticsBody}>
          {analyticsQuery.isPending && (
            <p className={styles.notice} role='status' aria-live='polite'>
              Carregando os contadores de acesso.
            </p>
          )}

          {analyticsQuery.error && (
            <div
              className={`${styles.notice} ${styles.noticeError}`}
              role='alert'
            >
              Não foi possível carregar os acessos.{' '}
              {displayError(analyticsQuery.error)}
            </div>
          )}

          {analyticsQuery.isSuccess &&
            analyticsQuery.data.totals.views === 0 && (
              <div className={styles.notice}>
                Ainda não há acessos registrados. A contagem só começa quando o
                site publicado estiver apontando para esta API (
                <code>VITE_ADMIN_API_URL</code>) e rodando em produção.
              </div>
            )}
        </div>
      </section>

      {analyticsQuery.isSuccess && analyticsQuery.data.totals.views > 0 && (
        <Summary summary={analyticsQuery.data} />
      )}
    </>
  )
}

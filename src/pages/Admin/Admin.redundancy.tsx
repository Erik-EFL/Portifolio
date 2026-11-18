import { useQuery } from '@tanstack/react-query'
import {
  getRedundancyStatus,
  REDUNDANCY_QUERY_KEY
} from '@/services/admin-api.service'
import styles from './Admin.module.css'
import { ICONS, Icon } from './Admin.icons'

const listIds = (ids: string[]): string => ids.join(', ')

/**
 * Diagnóstico do espelho no Supabase. Não é um botão de sincronizar: a cópia é
 * refeita em cada gravação e pelo script `functions/scripts/sync-supabase.mjs`;
 * aqui só se confere se as duas fontes contam a mesma história.
 */
export const RedundancyPanel = () => {
  const query = useQuery({
    queryKey: REDUNDANCY_QUERY_KEY,
    queryFn: getRedundancyStatus,
    staleTime: 30_000
  })

  const data = query.data
  const desligada = data?.configured === false
  const divergente =
    data !== undefined &&
    (data.missingInMirror.length > 0 || data.extraInMirror.length > 0)

  const pillLabel = query.isPending
    ? 'Verificando redundância'
    : query.error
    ? 'Redundância indisponível'
    : desligada
    ? 'Redundância desligada'
    : divergente
    ? 'Redundância divergente'
    : 'Redundância em dia'

  const pillDot =
    query.isPending || desligada
      ? styles.pillDotWarn
      : query.error || divergente
      ? styles.pillDotMuted
      : ''

  return (
    <section className={styles.card} aria-labelledby='redundancy-title'>
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardTitle} id='redundancy-title'>
            <Icon
              className={styles.cardTitleIcon}
              path={ICONS.restore}
              size={20}
            />
            Redundância — Supabase
          </h3>
          <p className={styles.cardSub}>
            Cópia do conteúdo e dos currículos fora do Google. Se o appbackend
            ou o Firebase Storage ficarem fora do ar, o site e os downloads
            passam a ser servidos por esta cópia.
          </p>
        </div>
        <span className={styles.pill}>
          <span className={`${styles.pillDot} ${pillDot}`} aria-hidden='true' />
          {pillLabel}
        </span>
      </div>

      {query.error && (
        <p className={`${styles.notice} ${styles.noticeError}`} role='alert'>
          Não foi possível consultar o espelho.{' '}
          {query.error instanceof Error ? query.error.message : ''}
        </p>
      )}

      {desligada && (
        <p className={styles.notice} role='status'>
          O servidor está sem as chaves do Supabase: nada é espelhado até
          configurar <code>SUPABASE_URL</code> e{' '}
          <code>SUPABASE_SECRET_KEY</code> nas secrets da function.
        </p>
      )}

      {data && !desligada && (
        <p className={styles.cardSub}>
          Espelho: <strong>{data.rowsInMirror ?? '—'}</strong> linha(s) ·
          appbackend: <strong>{data.rowsInPrimary ?? '—'}</strong> linha(s)
        </p>
      )}

      {data?.error && (
        <p className={styles.notice} role='alert'>
          {data.error}
        </p>
      )}

      {divergente && (
        <p className={styles.notice} role='status'>
          {data.missingInMirror.length > 0 && (
            <>Faltando no espelho: {listIds(data.missingInMirror)}. </>
          )}
          {data.extraInMirror.length > 0 && (
            <>Sobrando no espelho: {listIds(data.extraInMirror)}. </>
          )}
          Rode <code>node functions/scripts/sync-supabase.mjs</code> para
          reconciliar.
        </p>
      )}

      <button
        className={`${styles.btn} ${styles.btnGhost}`}
        type='button'
        onClick={() => void query.refetch()}
        disabled={query.isFetching}
      >
        {query.isFetching ? 'Verificando…' : 'Verificar de novo'}
      </button>
    </section>
  )
}

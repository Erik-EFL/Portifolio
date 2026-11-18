import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DataRow,
  DataSectionKey,
  mergePortfolioRows
} from '@/services/portfolio-data.service'
import {
  PORTFOLIO_ROWS_QUERY_KEY,
  createRows,
  deleteRows,
  getResumeAvailability,
  getRows,
  RESUME_AVAILABILITY_QUERY_KEY,
  updateRow
} from '@/services/admin-api.service'
import { useAdminAuthStore } from '@/store/admin-auth.store'
import { displayError } from '@/utils/display-error'
import styles from './Admin.module.css'
import {
  CONTENT_SECTION_KEYS,
  SECTION_FORM_ID,
  STRUCTURE_SECTION_KEYS,
  userInitials
} from './Admin.utils'
import { ICONS, Icon, SECTION_ICONS } from './Admin.icons'
import { SectionEditor } from './Admin.section-editor'
import { RedundancyPanel } from './Admin.redundancy'
import { ResumeUploader } from './Admin.resume'
import { AnalyticsPanel } from './Admin.analytics'

export const NavGroup = ({
  title,
  keys,
  savedKeys,
  activeKey,
  onSelect
}: {
  title: string
  keys: readonly DataSectionKey[]
  savedKeys: ReadonlySet<DataSectionKey>
  activeKey: DataSectionKey
  onSelect: (key: DataSectionKey) => void
}) => (
  <div className={styles.navGroup}>
    <p className={styles.navGroupTitle}>{title}</p>
    <ul className={styles.navList}>
      {keys.map(key => {
        const isSaved = savedKeys.has(key)
        return (
          <li key={key}>
            <button
              className={`${styles.navItem} ${
                activeKey === key ? styles.navItemActive : ''
              }`}
              type='button'
              aria-pressed={activeKey === key}
              onClick={() => onSelect(key)}
            >
              <span className={styles.navItemLabel}>
                <Icon
                  className={styles.navIcon}
                  path={SECTION_ICONS[key]}
                  size={16}
                />
                {key}
              </span>
              <span
                className={`${styles.navBadge} ${
                  isSaved ? styles.navBadgeSaved : ''
                }`}
              >
                {isSaved ? 'ativo' : 'fallback'}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  </div>
)

export const AdminConsole = () => {
  const queryClient = useQueryClient()
  const user = useAdminAuthStore(state => state.user)
  const signOut = useAdminAuthStore(state => state.signOut)
  const [activeKey, setActiveKey] = useState<DataSectionKey>('navigation')
  // Duas telas no mesmo console: edição de seção e os contadores de acesso.
  const [view, setView] = useState<'sections' | 'analytics'>('sections')
  const [notice, setNotice] = useState('')
  const [editorRevision, setEditorRevision] = useState(0)
  const rowsQuery = useQuery({
    queryKey: PORTFOLIO_ROWS_QUERY_KEY,
    queryFn: getRows,
    retry: 1
  })
  const availabilityQuery = useQuery({
    queryKey: RESUME_AVAILABILITY_QUERY_KEY,
    queryFn: getResumeAvailability,
    retry: 0
  })
  const rows = rowsQuery.data ?? []
  const mergedData = mergePortfolioRows(rows)
  const savedKeys = new Set(rows.map(row => row.key))
  const activeRow = rows.filter(row => row.key === activeKey).at(-1)
  const activeValue = activeRow?.value ?? mergedData[activeKey]

  const saveMutation = useMutation({
    mutationFn: async (section: DataRow): Promise<DataRow> => {
      const existing = rows.filter(row => row.key === section.key).at(-1)
      if (existing) {
        if (!existing._id) {
          throw new Error(
            'A linha salva não tem ID no servidor, então não pode ser atualizada.'
          )
        }
        await updateRow({
          _id: existing._id,
          key: section.key,
          value: section.value
        })
        return { ...section, _id: existing._id } as DataRow
      }

      const [created] = await createRows([
        { key: section.key, value: section.value }
      ])
      return created ?? section
    },
    onSuccess: (saved, section) => {
      // Seed the cache with the row the service just confirmed; a plain refetch
      // can still miss it, and saving again would then create a duplicate.
      queryClient.setQueryData<DataRow[]>(PORTFOLIO_ROWS_QUERY_KEY, current => [
        ...(current ?? []).filter(row => row.key !== section.key),
        saved
      ])
      void queryClient.invalidateQueries({
        queryKey: PORTFOLIO_ROWS_QUERY_KEY,
        refetchType: 'none'
      })
      setEditorRevision(revision => revision + 1)
      setNotice('Seção salva. O servidor autorizou a escrita.')
    },
    onError: (error: Error) => setNotice(error.message)
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteRows(ids),
    onSuccess: (_data, ids) => {
      queryClient.setQueryData<DataRow[]>(PORTFOLIO_ROWS_QUERY_KEY, current =>
        (current ?? []).filter(row => !row._id || !ids.includes(row._id))
      )
      void queryClient.invalidateQueries({
        queryKey: PORTFOLIO_ROWS_QUERY_KEY,
        refetchType: 'none'
      })
      setEditorRevision(revision => revision + 1)
      setNotice(
        'Seção removida do servidor. O fallback estático voltou a valer.'
      )
    },
    onError: (error: Error) => setNotice(error.message)
  })

  const handleDelete = () => {
    const matchingRows = rows.filter(row => row.key === activeKey)
    const ids = matchingRows.flatMap(row => (row._id ? [row._id] : []))

    if (ids.length !== matchingRows.length || ids.length === 0) {
      setNotice('Não é possível excluir: a linha do servidor está sem ID.')
      return
    }

    if (!window.confirm(`Excluir a seção "${activeKey}" do servidor?`)) return

    setNotice('')
    deleteMutation.mutate(ids)
  }

  const canMutate = rowsQuery.isSuccess
  const apiState = rowsQuery.isPending
    ? 'busy'
    : rowsQuery.error
    ? 'error'
    : 'online'
  const apiLabel = rowsQuery.isPending
    ? 'Conectando'
    : rowsQuery.error
    ? 'API indisponível'
    : 'Servidor online'
  const email = user?.email ?? ''

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIdentity}>
            <span className={styles.brandMark} aria-hidden='true'>
              {'</>'}
            </span>
            <div>
              <h1 className={styles.brandTitle}>DevPortfolio CMS</h1>
              <div className={styles.brandStatus}>
                <span className={styles.statusDot} data-state={apiState} />
                <span className={styles.statusText} data-state={apiState}>
                  {apiLabel}
                </span>
              </div>
            </div>
          </div>
          <a
            className={styles.iconButton}
            href='/'
            title='Abrir o site'
            aria-label='Abrir o site'
          >
            <Icon path={ICONS.external} size={16} />
          </a>
        </div>

        <nav className={styles.nav} aria-label='Seções de conteúdo'>
          <NavGroup
            title='Conteúdo do Portfólio'
            keys={CONTENT_SECTION_KEYS}
            savedKeys={savedKeys}
            activeKey={activeKey}
            onSelect={key => {
              setActiveKey(key)
              setView('sections')
              setNotice('')
            }}
          />
          <NavGroup
            title='Estrutura & Metadados'
            keys={STRUCTURE_SECTION_KEYS}
            savedKeys={savedKeys}
            activeKey={activeKey}
            onSelect={key => {
              setActiveKey(key)
              setView('sections')
              setNotice('')
            }}
          />
          <div className={styles.navGroup}>
            <p className={styles.navGroupTitle}>Operação</p>
            <ul className={styles.navList}>
              <li>
                <button
                  className={`${styles.navItem} ${
                    view === 'analytics' ? styles.navItemActive : ''
                  }`}
                  type='button'
                  aria-pressed={view === 'analytics'}
                  onClick={() => {
                    setView('analytics')
                    setNotice('')
                  }}
                >
                  <span className={styles.navItemLabel}>
                    <Icon
                      className={styles.navIcon}
                      path={ICONS.eye}
                      size={16}
                    />
                    Acessos
                  </span>
                  <span
                    className={`${styles.navBadge} ${styles.navBadgeSaved}`}
                  >
                    visitas
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className={styles.userCard}>
          <div className={styles.userIdentity}>
            <span className={styles.avatar} aria-hidden='true'>
              {userInitials(email)}
            </span>
            <div className={styles.userMeta}>
              <p className={styles.userName}>Administrador</p>
              <p className={styles.userEmail} title={email}>
                {email}
              </p>
            </div>
            <button
              className={styles.iconButton}
              type='button'
              onClick={signOut}
              title='Sair'
              aria-label='Sair'
            >
              <Icon path={ICONS.logout} size={16} />
            </button>
          </div>
        </div>
      </aside>

      <section className={styles.workArea}>
        <header className={styles.topbar}>
          <div className={styles.topbarMain}>
            <span className={styles.breadcrumb} aria-hidden='true'>
              database<span className={styles.breadcrumbSep}>/</span>
              {view === 'analytics' ? 'analytics' : 'sections'}
              {view === 'sections' && (
                <>
                  <span className={styles.breadcrumbSep}>/</span>
                  {activeKey}
                </>
              )}
            </span>
            <h2 className={styles.topbarTitle}>
              {view === 'analytics' ? 'acessos' : activeKey}
              {view === 'sections' && (
                <span
                  className={`${styles.badge} ${
                    activeRow ? styles.badgeSaved : styles.badgeFallback
                  }`}
                >
                  {activeRow
                    ? 'linha no servidor'
                    : 'fallback ativo (sem linha)'}
                </span>
              )}
            </h2>
          </div>
          <div className={styles.topbarActions}>
            {view === 'sections' && (
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                type='submit'
                form={SECTION_FORM_ID}
                disabled={
                  !canMutate ||
                  saveMutation.isPending ||
                  deleteMutation.isPending
                }
                title={
                  canMutate
                    ? undefined
                    : 'Indisponível enquanto a lista de linhas do servidor não carregar.'
                }
              >
                <Icon path={ICONS.check} size={16} />
                {saveMutation.isPending
                  ? 'Salvando…'
                  : 'Salvar Seção no Servidor'}
              </button>
            )}
          </div>
        </header>

        <div className={styles.content}>
          {view === 'analytics' ? (
            <AnalyticsPanel />
          ) : (
            <>
              {rowsQuery.isPending && (
                <p className={styles.notice} role='status' aria-live='polite'>
                  Carregando conteúdo do servidor. A edição fica bloqueada até a
                  lista de linhas carregar.
                </p>
              )}
              {rowsQuery.error && (
                <div
                  className={`${styles.notice} ${styles.noticeError}`}
                  role='alert'
                >
                  Não foi possível carregar o conteúdo do servidor; o fallback
                  está sendo exibido e as escritas estão desabilitadas.{' '}
                  {displayError(rowsQuery.error)}{' '}
                  <button
                    className={`${styles.btn} ${styles.btnGhost}`}
                    type='button'
                    onClick={() => void rowsQuery.refetch()}
                  >
                    Tentar de novo
                  </button>
                </div>
              )}

              <section className={styles.card} aria-labelledby='resumes-title'>
                <div className={styles.cardHead}>
                  <div>
                    <h3 className={styles.cardTitle} id='resumes-title'>
                      <Icon
                        className={styles.cardTitleIcon}
                        path={ICONS.file}
                        size={20}
                      />
                      About Me — Currículos &amp; documentos
                    </h3>
                    <p className={styles.cardSub}>
                      O upload substitui o PDF armazenado para o idioma
                      correspondente. Cada gravação é autorizada pelo servidor.
                    </p>
                  </div>
                  <span className={styles.pill}>
                    <span
                      className={`${styles.pillDot} ${
                        availabilityQuery.isSuccess
                          ? ''
                          : availabilityQuery.error
                          ? styles.pillDotMuted
                          : styles.pillDotWarn
                      }`}
                      aria-hidden='true'
                    />
                    {availabilityQuery.isSuccess
                      ? 'Storage conectado'
                      : availabilityQuery.error
                      ? 'Storage indisponível'
                      : 'Verificando storage'}
                  </span>
                </div>
                <div className={styles.resumeGrid}>
                  <ResumeUploader
                    language='ptBR'
                    label='Português (ptBR)'
                    available={availabilityQuery.data?.ptBR}
                  />
                  <ResumeUploader
                    language='enUS'
                    label='English (enUS)'
                    available={availabilityQuery.data?.enUS}
                  />
                </div>
              </section>

              <RedundancyPanel />

              <SectionEditor
                key={`${activeKey}:${
                  rowsQuery.isSuccess ? 'loaded' : 'not-loaded'
                }:${editorRevision}`}
                keyName={activeKey}
                value={activeValue}
                remoteRow={activeRow}
                canMutate={canMutate}
                onSave={section => {
                  setNotice('')
                  saveMutation.mutate(section)
                }}
                onDelete={handleDelete}
                isSaving={saveMutation.isPending}
                isDeleting={deleteMutation.isPending}
                notice={notice}
                setNotice={setNotice}
              />
            </>
          )}
        </div>
      </section>
    </main>
  )
}

/* ---------- Gate de autorização ---------- */

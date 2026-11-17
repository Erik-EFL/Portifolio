import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AdminApiError, getAdminSession } from '@/services/admin-api.service'
import { AdminAuthUser } from '@/services/firebase-auth.service'
import { useAdminAuthStore } from '@/store/admin-auth.store'
import { displayError } from '@/utils/display-error'
import styles from './Admin.module.css'
import { AdminConsole } from './Admin.console'

export const AccessState = ({
  title,
  message,
  children
}: {
  title: string
  message: string
  children?: ReactNode
}) => (
  <main className={styles.authShell}>
    <section className={styles.authCard} role='status' aria-live='polite'>
      <div className={styles.authBrand}>
        <span className={styles.brandMark} aria-hidden='true'>
          {'</>'}
        </span>
        <div>
          <h1 className={styles.authTitle}>{title}</h1>
          <p className={styles.authSub}>{message}</p>
        </div>
      </div>
      <div className={styles.authActions}>{children}</div>
    </section>
  </main>
)

export const AdminAccessGate = ({ user }: { user: AdminAuthUser }) => {
  const signOut = useAdminAuthStore(state => state.signOut)
  const sessionQuery = useQuery({
    queryKey: ['admin-session', user.uid],
    queryFn: getAdminSession,
    retry: false
  })

  if (sessionQuery.isPending) {
    return (
      <AccessState
        title='Verificando acesso'
        message='Validando esta conta Firebase junto ao servidor. O editor permanece oculto até a autorização.'
      >
        <button
          className={`${styles.btn} ${styles.btnSubtle}`}
          type='button'
          onClick={signOut}
        >
          Sair
        </button>
      </AccessState>
    )
  }

  if (sessionQuery.error) {
    const error = sessionQuery.error
    const denied =
      error instanceof AdminApiError &&
      (error.status === 401 || error.status === 403)

    return (
      <AccessState
        title={denied ? 'Acesso negado' : 'Acesso indisponível'}
        message={
          denied
            ? `O servidor negou o acesso administrativo (HTTP ${error.status}). O editor está oculto.`
            : 'Não foi possível verificar a autorização no servidor. O editor está oculto.'
        }
      >
        {!denied && (
          <p className={`${styles.notice} ${styles.noticeError}`} role='alert'>
            {displayError(error)}
          </p>
        )}
        {!denied && (
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type='button'
            onClick={() => void sessionQuery.refetch()}
          >
            Tentar de novo
          </button>
        )}
        <button
          className={`${styles.btn} ${styles.btnSubtle}`}
          type='button'
          onClick={signOut}
        >
          Sair
        </button>
      </AccessState>
    )
  }

  const serverSession = sessionQuery.data
  const emailMatches =
    serverSession?.email.trim().toLowerCase() ===
    user.email.trim().toLowerCase()

  if (!serverSession || serverSession.role !== 'admin' || !emailMatches) {
    return (
      <AccessState
        title='Acesso negado'
        message='O servidor não autorizou esta conta Firebase como administradora. O editor está oculto.'
      >
        <p className={`${styles.notice} ${styles.noticeError}`} role='alert'>
          {serverSession
            ? `Sessão do servidor: ${serverSession.email} (${serverSession.role}).`
            : 'Resposta de sessão inválida do servidor.'}
        </p>
        <button
          className={`${styles.btn} ${styles.btnSubtle}`}
          type='button'
          onClick={signOut}
        >
          Sair
        </button>
      </AccessState>
    )
  }

  return <AdminConsole />
}

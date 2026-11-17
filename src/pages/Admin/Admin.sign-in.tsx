import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  AdminAuthUser,
  signInWithEmailPassword,
  signInWithGoogle
} from '@/services/firebase-auth.service'
import { useAdminAuthStore } from '@/store/admin-auth.store'
import { displayError } from '@/utils/display-error'
import styles from './Admin.module.css'

export const SignInForm = () => {
  const setUser = useAdminAuthStore(state => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user: AdminAuthUser = await signInWithEmailPassword(email, password)
      setUser(user)
      setPassword('')
    } catch (reason) {
      setError(displayError(reason))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      const user: AdminAuthUser = await signInWithGoogle()
      setUser(user)
    } catch (reason) {
      setError(displayError(reason))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.authShell}>
      <section className={styles.authCard} aria-labelledby='admin-signin-title'>
        <div className={styles.authBrand}>
          <span className={styles.brandMark} aria-hidden='true'>
            {'</>'}
          </span>
          <div>
            <h1 className={styles.authTitle} id='admin-signin-title'>
              Acesso administrativo
            </h1>
            <p className={styles.authSub}>
              Entre com uma conta habilitada no Firebase Authentication.
            </p>
          </div>
        </div>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor='admin-email'>
              Email
            </label>
            <input
              className={styles.input}
              id='admin-email'
              name='email'
              type='email'
              autoComplete='username'
              placeholder='voce@exemplo.com'
              required
              value={email}
              onChange={event => setEmail(event.currentTarget.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor='admin-password'>
              Senha
            </label>
            <input
              className={styles.input}
              id='admin-password'
              name='password'
              type='password'
              autoComplete='current-password'
              placeholder='••••••••'
              required
              value={password}
              onChange={event => setPassword(event.currentTarget.value)}
            />
          </div>
          <div className={styles.authActions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              type='submit'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </button>
            <button
              className={`${styles.btn} ${styles.btnSubtle}`}
              type='button'
              disabled={isSubmitting}
              onClick={() => void handleGoogleSignIn()}
            >
              Continuar com Google
            </button>
          </div>
          {error && (
            <p
              className={`${styles.notice} ${styles.noticeError}`}
              role='alert'
            >
              {error}
            </p>
          )}
        </form>
        <p className={styles.authFoot}>
          Toda escrita é autorizada pelo servidor: ocultar a rota não é controle
          de acesso.
        </p>
      </section>
    </main>
  )
}

/* ---------- Editor de seção ---------- */

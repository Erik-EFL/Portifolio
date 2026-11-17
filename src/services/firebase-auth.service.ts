import { getApps, initializeApp } from 'firebase/app'
import {
  browserPopupRedirectResolver,
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  initializeAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
  type User
} from 'firebase/auth'

/**
 * Only the signed-in identity is mirrored here so the UI can hydrate
 * synchronously. Tokens stay inside the Firebase SDK persistence layer and are
 * always minted on demand by `getFirebaseIdToken`; the server verifies them.
 */
const SESSION_MIRROR_KEY = 'portfolio.firebase-auth-session'

export interface AdminAuthUser {
  uid: string
  email: string
}

interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address is not valid.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/invalid-login-credentials': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/email-already-in-use': 'That email address already has an account.',
  'auth/weak-password': 'The password is too weak.',
  'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  'auth/operation-not-allowed':
    'This sign-in method is not enabled in Firebase Authentication.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/popup-blocked': 'The browser blocked the sign-in popup.',
  'auth/unauthorized-domain':
    'This domain is not authorized for Google sign-in in Firebase Authentication.',
  'auth/network-request-failed':
    'Could not reach Firebase Authentication. Check the emulator or your connection.'
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const readFirebaseConfig = (): FirebaseConfig => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  const appId = import.meta.env.VITE_FIREBASE_APP_ID

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      'Firebase Auth is not configured: set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_APP_ID.'
    )
  }

  return { apiKey, authDomain, projectId, appId }
}

const authEmulatorUrl = (): string | undefined => {
  const host = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST?.trim()
  if (!host) return undefined
  return /^https?:\/\//.test(host) ? host.replace(/\/+$/, '') : `http://${host}`
}

let cachedAuth: Auth | null = null

const getFirebaseAuth = (): Auth => {
  if (cachedAuth) return cachedAuth

  const app = getApps()[0] ?? initializeApp(readFirebaseConfig())
  let auth: Auth

  try {
    auth = initializeAuth(app, {
      persistence: browserSessionPersistence,
      // Required by signInWithPopup: initializeAuth does not register the
      // browser resolver implicitly the way getAuth does.
      popupRedirectResolver: browserPopupRedirectResolver
    })
  } catch {
    // Auth is already initialized for this app (Vite HMR re-runs this module).
    auth = getAuth(app)
  }

  const emulatorUrl = authEmulatorUrl()
  if (emulatorUrl && !auth.emulatorConfig) {
    connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true })
    console.info(
      `Firebase Authentication is using the emulator at ${emulatorUrl}`
    )
  }

  cachedAuth = auth
  return auth
}

const toAdminUser = (user: User): AdminAuthUser => {
  if (!user.email) {
    throw new Error('The signed-in account has no email address.')
  }
  return { uid: user.uid, email: user.email }
}

const describeAuthError = (error: unknown): Error => {
  const code =
    isRecord(error) && typeof error.code === 'string' ? error.code : ''
  const message = AUTH_ERROR_MESSAGES[code]
  if (message) return new Error(message)
  if (error instanceof Error) return error
  return new Error('Firebase Authentication failed.')
}

const readMirror = (): AdminAuthUser | null => {
  try {
    const raw = window.sessionStorage.getItem(SESSION_MIRROR_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      isRecord(parsed) &&
      typeof parsed.uid === 'string' &&
      typeof parsed.email === 'string'
    ) {
      return { uid: parsed.uid, email: parsed.email }
    }
  } catch {
    return null
  }
  return null
}

const saveMirror = (user: AdminAuthUser): void => {
  try {
    window.sessionStorage.setItem(SESSION_MIRROR_KEY, JSON.stringify(user))
  } catch {
    // Storage can be unavailable (private mode); the server still authorizes.
  }
}

export const getStoredAdminUser = (): AdminAuthUser | null => readMirror()

export const signInWithEmailPassword = async (
  email: string,
  password: string
): Promise<AdminAuthUser> => {
  try {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password
    )
    const user = toAdminUser(credential.user)
    saveMirror(user)
    return user
  } catch (error) {
    throw describeAuthError(error)
  }
}

export const signInWithGoogle = async (): Promise<AdminAuthUser> => {
  try {
    const credential = await signInWithPopup(
      getFirebaseAuth(),
      new GoogleAuthProvider()
    )
    const user = toAdminUser(credential.user)
    saveMirror(user)
    return user
  } catch (error) {
    throw describeAuthError(error)
  }
}

export const getFirebaseIdToken = async (): Promise<string> => {
  const auth = getFirebaseAuth()

  // Waits for the persisted session, so a page reload keeps working.
  await auth.authStateReady()

  const user = auth.currentUser
  if (!user) {
    throw new Error('Sign in before making an admin request.')
  }

  // The SDK refreshes the token when it is close to expiry.
  const idToken = await user.getIdToken()
  if (!idToken.trim()) {
    throw new Error('Firebase ID token is missing or expired. Sign in again.')
  }

  if (user.email) saveMirror({ uid: user.uid, email: user.email })
  return idToken
}

export const clearFirebaseAuthSession = async (): Promise<void> => {
  try {
    window.sessionStorage.removeItem(SESSION_MIRROR_KEY)
  } catch {
    // Ignore storage failures; the sign-out below still clears the SDK session.
  }

  try {
    await signOut(getFirebaseAuth())
  } catch {
    // Signing out a misconfigured/never-initialized SDK must not throw.
  }
}

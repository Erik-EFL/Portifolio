import type { TLanguage } from '@/@types/portfolio.entity'

/**
 * Rotas contadas como acesso. Precisa ser o mesmo conjunto aceito pela
 * `functions` (`PAGE_VIEW_PATHS`): rota fora daqui é recusada com 400.
 * `/admin` e `/contacts` ficam de fora — o painel é o dono se olhando.
 */
export const ANALYTICS_PATHS = ['home', 'about', 'skills', 'projects'] as const
export type AnalyticsPath = (typeof ANALYTICS_PATHS)[number]

const ROUTE_TO_PATH: Record<string, AnalyticsPath> = {
  '/': 'home',
  '/about': 'about',
  '/skills': 'skills',
  '/projects': 'projects'
}

/**
 * `useLocation().pathname` vem com o `basename` do router (`/Portifolio/skills`
 * no GitHub Pages), então o prefixo do BASE_URL precisa sair antes do mapa.
 */
export const resolveAnalyticsPath = (
  pathname: string,
  baseUrl: string = '/'
): AnalyticsPath | undefined => {
  let route = pathname
  const base = baseUrl.replace(/\/+$/, '')

  if (base && (route === base || route.startsWith(`${base}/`))) {
    route = route.slice(base.length)
  }
  if (!route.startsWith('/')) route = `/${route}`
  route = route.replace(/\/+$/, '') || '/'

  return ROUTE_TO_PATH[route]
}

const VISITOR_STORAGE_KEY = 'portfolio.visitor'
export const VISITOR_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/

const safeStorage = (): Storage | undefined => {
  try {
    return window.localStorage
  } catch {
    // Navegador com cookie/storage bloqueado: cai no modo anônimo (sem ID).
    return undefined
  }
}

const createVisitorId = (): string => {
  try {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID()
    }
  } catch {
    // randomUUID exige contexto seguro; segue para o plano B.
  }
  return `v-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

/**
 * ID aleatório persistido no navegador. Não é cookie, não identifica ninguém:
 * serve só para "visitantes únicos" não contarem o mesmo visitante duas vezes
 * no mesmo dia.
 */
export const getVisitorId = (
  // `null` = navegador sem storage; `undefined` cai no padrão do ambiente.
  storage: Storage | null | undefined = safeStorage() ?? null
): string => {
  if (!storage) return ''

  try {
    const stored = storage.getItem(VISITOR_STORAGE_KEY)
    if (stored && VISITOR_ID_PATTERN.test(stored)) return stored

    const created = createVisitorId()
    storage.setItem(VISITOR_STORAGE_KEY, created)
    return created
  } catch {
    return ''
  }
}

export interface TrackPageViewOptions {
  path: AnalyticsPath
  language: TLanguage
}

interface TrackEnvironment {
  isProduction: boolean
  isTrackingEnabled: boolean
  apiUrl: string
  doNotTrack: boolean
}

/** Separado do envio para poder testar as regras sem build de produção. */
export const shouldTrackPageView = (environment: TrackEnvironment): boolean => {
  if (!environment.apiUrl) return false
  if (environment.doNotTrack) return false
  return environment.isProduction || environment.isTrackingEnabled
}

const TRACK_TIMEOUT_MS = 4000

/**
 * Fire-and-forget: medição nunca pode atrasar nem quebrar a página. Todo erro
 * (rede, CORS, 400) é engolido de propósito — o visitante não tem o que fazer
 * com ele.
 */
export const trackPageView = async ({
  path,
  language
}: TrackPageViewOptions): Promise<void> => {
  const apiUrl = (import.meta.env.VITE_ADMIN_API_URL ?? '').replace(/\/+$/, '')
  const doNotTrack =
    typeof navigator !== 'undefined' &&
    (navigator.doNotTrack === '1' ||
      (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack === '1')

  if (
    !shouldTrackPageView({
      isProduction: import.meta.env.PROD === true,
      isTrackingEnabled: import.meta.env.VITE_ANALYTICS === 'on',
      apiUrl,
      doNotTrack
    })
  ) {
    return
  }

  const visitorId = getVisitorId()
  if (!visitorId) return

  try {
    await fetch(`${apiUrl}/api/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, language, visitorId }),
      // keepalive: o pageview costuma ser enviado enquanto o visitante navega
      // para outra rota; sem isso o navegador pode cancelar a requisição.
      keepalive: true,
      signal: AbortSignal.timeout(TRACK_TIMEOUT_MS)
    })
  } catch {
    // silencioso por desenho
  }
}

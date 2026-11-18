import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getVisitorId,
  resolveAnalyticsPath,
  shouldTrackPageView,
  trackPageView
} from './page-view'

describe('resolveAnalyticsPath', () => {
  it('mapeia as rotas públicas contadas', () => {
    expect(resolveAnalyticsPath('/')).toBe('home')
    expect(resolveAnalyticsPath('/about')).toBe('about')
    expect(resolveAnalyticsPath('/skills')).toBe('skills')
    expect(resolveAnalyticsPath('/projects')).toBe('projects')
  })

  it('descarta o basename do GitHub Pages antes de mapear', () => {
    expect(resolveAnalyticsPath('/Portifolio/', '/Portifolio/')).toBe('home')
    expect(resolveAnalyticsPath('/Portifolio', '/Portifolio/')).toBe('home')
    expect(resolveAnalyticsPath('/Portifolio/skills', '/Portifolio/')).toBe(
      'skills'
    )
    // sem o prefixo, "Portifolio" seria confundido com uma rota
    expect(resolveAnalyticsPath('/Portifolio/skills')).toBeUndefined()
  })

  it('ignora barra final, painel e rotas desconhecidas', () => {
    expect(resolveAnalyticsPath('/projects/')).toBe('projects')
    expect(resolveAnalyticsPath('/admin')).toBeUndefined()
    expect(resolveAnalyticsPath('/contacts')).toBeUndefined()
  })
})

describe('shouldTrackPageView', () => {
  const base = {
    isProduction: true,
    isTrackingEnabled: false,
    apiUrl: 'https://api.example.com',
    doNotTrack: false
  }

  it('só mede em produção (ou com a flag ligada) e com API configurada', () => {
    expect(shouldTrackPageView(base)).toBe(true)
    expect(shouldTrackPageView({ ...base, isProduction: false })).toBe(false)
    expect(
      shouldTrackPageView({
        ...base,
        isProduction: false,
        isTrackingEnabled: true
      })
    ).toBe(true)
    expect(shouldTrackPageView({ ...base, apiUrl: '' })).toBe(false)
  })

  it('respeita Do Not Track', () => {
    expect(shouldTrackPageView({ ...base, doNotTrack: true })).toBe(false)
  })
})

describe('getVisitorId', () => {
  const createStorage = (initial: Record<string, string> = {}) => {
    const data = new Map(Object.entries(initial))
    return {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value)
    } as unknown as Storage
  }

  it('cria e persiste um identificador no primeiro acesso', () => {
    const storage = createStorage()
    const created = getVisitorId(storage)

    expect(created).toMatch(/^[A-Za-z0-9-]{8,64}$/)
    expect(getVisitorId(storage)).toBe(created)
  })

  it('substitui valor corrompido em vez de reutilizar', () => {
    const storage = createStorage({ 'portfolio.visitor': 'curto' })
    expect(getVisitorId(storage)).not.toBe('curto')
  })

  it('devolve vazio quando o navegador bloqueia o storage', () => {
    expect(getVisitorId(null)).toBe('')
  })
})

describe('trackPageView', () => {
  const fetchMock = vi.fn(() =>
    Promise.resolve(new Response(null, { status: 204 }))
  )

  beforeEach(() => {
    fetchMock.mockClear()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('VITE_ADMIN_API_URL', 'https://api.example.com/')
    vi.stubEnv('VITE_ANALYTICS', 'on')
  })

  it('envia um POST com rota, idioma e identificador', async () => {
    await trackPageView({ path: 'skills', language: 'enUS' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit
    ]
    expect(url).toBe('https://api.example.com/api/analytics/pageview')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toMatchObject({
      path: 'skills',
      language: 'enUS'
    })
  })

  it('não deixa erro de rede escapar para a página', async () => {
    fetchMock.mockImplementationOnce(() => Promise.reject(new Error('offline')))
    await expect(
      trackPageView({ path: 'home', language: 'ptBR' })
    ).resolves.toBeUndefined()
  })

  it('não envia nada quando não há API configurada', async () => {
    vi.stubEnv('VITE_ADMIN_API_URL', '')
    await trackPageView({ path: 'home', language: 'ptBR' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

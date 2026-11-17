import type { Page } from '@playwright/test'
import type { IProject } from '../src/@types/projects.entity'

/**
 * A API do admin não roda nos testes de e2e: respondemos rápido com 503 para o
 * app cair no conteúdo estático (fallback) em vez de esperar timeout.
 */
export const stubAdminApi = async (page: Page): Promise<void> => {
  await page.route('http://127.0.0.1:5001/**', route =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'backend offline (e2e)' } })
    })
  )
}

const repositorio = (overrides: Partial<IProject>): IProject => ({
  id: 1,
  name: 'repo',
  description: 'descrição',
  html_url: 'https://github.com/Erik-EFL/repo',
  homepage: null,
  fork: false,
  visibility: 'public',
  language: 'TypeScript',
  ...overrides
})

/** 4 repos: 2 válidos (um com homepage), 1 da lista ignorada e 1 fork. */
export const projectsFixture: IProject[] = [
  repositorio({
    id: 553847256,
    name: 'AppDelivery',
    homepage: 'https://appdelivery.example.com'
  }),
  repositorio({ id: 999, name: 'SemHomepage', homepage: null }),
  repositorio({ id: 1000, name: 'projetos' }),
  repositorio({ id: 1001, name: 'fork-alheio', fork: true })
]

export const stubGithub = async (
  page: Page,
  payload: IProject[] = projectsFixture
): Promise<void> => {
  await page.route('https://api.github.com/**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload)
    })
  )
}

export const stubGithubError = async (
  page: Page,
  status = 403
): Promise<void> => {
  await page.route('https://api.github.com/**', route =>
    route.fulfill({ status, contentType: 'application/json', body: '[]' })
  )
}

import { expect, test } from '@playwright/test'
import { stubAdminApi, stubGithub, stubGithubError } from './fixtures'

test.beforeEach(async ({ page }) => {
  await stubAdminApi(page)
})

test.describe('página inicial', () => {
  test('renderiza o hero a partir do conteúdo estático', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('img', { name: 'imagem de Erik lima' })
    ).toBeVisible()
    await expect(page.getByText('Erik Ferreira Lima').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sobre mim' })).toBeVisible()
  })

  test('não deixa a página presa no skeleton quando a API está fora', async ({
    page
  }) => {
    await page.goto('/')

    await expect(page.locator('[role="status"]')).toHaveCount(0)
    await expect(page.getByRole('alert')).toContainText(/unavailable|fallback/i)
  })
})

test.describe('tema', () => {
  test('alterna e mantém a escolha depois do reload', async ({
    page,
    isMobile
  }) => {
    test.skip(isMobile, 'o toggle do tema só aparece no desktop')

    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.locator('header .checkTheme label').click()

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(
      'dark'
    )

    await page.reload()

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})

test.describe('idioma', () => {
  test('troca os rótulos sem recarregar a página', async ({
    page,
    isMobile
  }) => {
    test.skip(isMobile, 'o toggle de idioma vive no footer, oculto no mobile')

    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Projetos' })).toBeVisible()

    const marcador = await page.evaluate(() => {
      const w = window as unknown as { __marcador?: number }
      w.__marcador = 42
      return w.__marcador
    })
    expect(marcador).toBe(42)

    await page.locator('footer .toggleTheme input').click()

    await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible()
    // se tivesse havido reload, o marcador no window teria sumido
    expect(
      await page.evaluate(
        () => (window as unknown as { __marcador?: number }).__marcador
      )
    ).toBe(42)
  })
})

test.describe('navegação', () => {
  test('navega pelo menu do topo (desktop)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'no mobile a navegação é a barra inferior')

    await page.goto('/')
    await page.getByRole('link', { name: 'Habilidades' }).click()
    await expect(page).toHaveURL(/\/skills$/)
    await expect(page.getByRole('heading', { name: 'Front-end' })).toBeVisible()

    await page.getByRole('link', { name: 'Sobre' }).click()
    await expect(page).toHaveURL(/\/about$/)
  })
})

test.describe('skills', () => {
  test('cards empilhados, um abaixo do outro', async ({ page }) => {
    await page.goto('/skills')

    const cards = page
      .locator('section')
      .filter({ has: page.locator('header h3') })
    await expect(cards).toHaveCount(7)

    const primeiro = await cards.first().boundingBox()
    const segundo = await cards.nth(1).boundingBox()

    expect(primeiro?.x).toBe(segundo?.x)
    expect((segundo?.y ?? 0) > (primeiro?.y ?? 0)).toBe(true)
  })
})

test.describe('projetos', () => {
  test('lista os repos filtrando forks e mostrando o site quando existe', async ({
    page
  }) => {
    await stubGithub(page)
    await page.goto('/projects')

    const cards = page.locator('.MuiCard-root')
    await expect(cards).toHaveCount(2)
    await expect(cards.first()).toContainText('AppDelivery')
    await expect(
      cards.first().getByRole('button', { name: 'Site' })
    ).toBeVisible()
    await expect(
      cards.nth(1).getByRole('button', { name: 'Site' })
    ).toHaveCount(0)
  })

  test('mostra erro com retry quando a API do GitHub falha', async ({
    page
  }) => {
    await stubGithubError(page)
    await page.goto('/projects')

    await expect(
      page.getByRole('alert').filter({ hasText: 'Não foi possível' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Tentar novamente' })
    ).toBeVisible()
  })
})

test.describe('admin', () => {
  test('exige login', async ({ page }) => {
    await page.goto('/admin')

    await expect(
      page.getByRole('heading', { name: 'Acesso administrativo' })
    ).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })
})

import { expect, test } from '@playwright/test'
import { stubAdminApi } from './fixtures'

test.beforeEach(async ({ page }) => {
  await stubAdminApi(page)
})

test.describe('navegação inferior (mobile)', () => {
  test('mostra os 4 botões e navega por eles', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'específico do mobile')

    await page.goto('/')

    const barra = page.getByRole('navigation', { name: 'Navegação principal' })
    await expect(barra).toBeVisible()
    await expect(barra.getByRole('link')).toHaveCount(4)

    await barra.getByRole('link', { name: 'Habilidades' }).click()

    await expect(page).toHaveURL(/\/skills$/)
    await expect(barra.getByRole('link', { name: 'Habilidades' })).toHaveClass(
      /active/
    )
  })

  test('não exibe o menu do header no mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'específico do mobile')

    await page.goto('/')

    await expect(page.locator('.navMenu')).toBeHidden()
  })

  test('não cria scroll horizontal', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'específico do mobile')

    await page.goto('/skills')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    )
    expect(overflow).toBe(false)
  })
})

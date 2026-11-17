import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { stubAdminApi } from './fixtures'

/**
 * Barreira de acessibilidade: falha só em `serious`/`critical`. Violações de
 * impacto menor (contraste de detalhe decorativo, etc.) ficam listadas no
 * relatório do axe para virar backlog, sem travar o pipeline por elas.
 */
const ROTAS = ['/', '/about', '/skills', '/projects'] as const

test.beforeEach(async ({ page }) => {
  await stubAdminApi(page)
})

for (const rota of ROTAS) {
  test(`sem violações graves em ${rota}`, async ({ page }) => {
    await page.goto(rota)

    // espera o skeleton sair: analisar no meio do carregamento mede o placeholder
    await page.waitForFunction(
      () => !document.querySelector('[role="status"][aria-busy="true"]'),
      undefined,
      { timeout: 10_000 }
    )

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // o player do YouTube é DOM de terceiro: não temos como corrigir nem
      // garantir a marcação dele
      .exclude('iframe')
      .analyze()

    const graves = violations.filter(violacao =>
      ['serious', 'critical'].includes(violacao.impact ?? '')
    )

    expect(
      graves.map(
        v => `${v.id} (${v.impact}): ${v.nodes.length} nó(s) — ${v.help}`
      )
    ).toEqual([])
  })
}

test('o toggle de tema existe e funciona no mobile', async ({
  page,
  isMobile
}) => {
  test.skip(!isMobile, 'específico do mobile')

  await page.goto('/')

  const botao = page.getByRole('button', { name: /tema (claro|escuro)/ })
  await expect(botao).toBeVisible()

  const antes = await page.locator('html').getAttribute('data-theme')
  await botao.click()

  await expect(page.locator('html')).not.toHaveAttribute(
    'data-theme',
    antes ?? ''
  )
})

test('a página tem um único h1 e imagens com alt', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('h1')).toHaveCount(1)

  const semAlt = await page.locator('img:not([alt])').count()
  expect(semAlt).toBe(0)
})

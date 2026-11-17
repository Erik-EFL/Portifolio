import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const baseURL = `http://127.0.0.1:${PORT}`

// `src/vite-env.d.ts` declara process.env só com NODE_ENV
const env = process.env as Record<string, string | undefined>
const CI = Boolean(env.CI)

export default defineConfig({
  testDir: './e2e',
  timeout: 40_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    // O service worker registra no build de produção e pode servir HTML velho
    // entre navegações do mesmo teste.
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    video: 'off'
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !CI,
    timeout: 180_000
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1400, height: 900 }
      }
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] }
    }
  ]
})

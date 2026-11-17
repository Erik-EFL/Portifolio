import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Endereço público do site quando VITE_SITE_URL não está definido.
const DEFAULT_SITE_URL = 'https://erik-efl.github.io/Portifolio'

// Substitui %SITE_URL% no index.html: canonical, og:url e og:image têm que ser
// absolutos, e o domínio pode mudar sem tocar em meta tag nenhuma.
const siteUrlPlugin = siteUrl => ({
  name: 'site-url',
  transformIndexHtml: html => html.replaceAll('%SITE_URL%', siteUrl)
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')
  // Projeto no GitHub Pages mora em subpasta (/Portifolio/); domínio próprio
  // mora na raiz. Quem decide é o ambiente de deploy, não o código.
  const base = env.VITE_BASE_PATH || '/'

  return {
    base,
    // Em teste o plugin de react-refresh injeta $RefreshSig$ e quebra o import
    // dos módulos; o esbuild já transforma o JSX pelo tsconfig.
    plugins: mode === 'test' ? [] : [react(), siteUrlPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        output: {
          // Vendor em chunks próprios: sem isso trocar uma linha de componente
          // invalidava o cache de ~700 kB de biblioteca. (rolldown só aceita
          // manualChunks como função.)
          manualChunks: id => {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('@mui')) return 'vendor-mui'
            if (id.includes('styled-components')) return 'vendor-styled'
            if (id.includes('@tanstack')) return 'vendor-query'
            if (id.includes('firebase')) return 'vendor-firebase'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('/react-dom/') || id.includes('/react/')) {
              return 'vendor-react'
            }

            return 'vendor'
          }
        }
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.d.ts',
          'src/@types/**',
          'src/main.tsx',
          'src/test/**',
          // Módulos só de visual: sem ramificação para testar e cobertos pelos
          // e2e/screenshots. Incluí-los só diluía o número.
          'src/**/*.style.ts',
          'src/**/*.styled.ts',
          'src/Styles/**'
        ],
        // Piso = cobertura real medida (44% de linhas): o objetivo é travar
        // regressão, não fingir qualidade. Suba o piso junto com os testes.
        thresholds: {
          statements: 43,
          branches: 35,
          functions: 38,
          lines: 43
        }
      }
    }
  }
})

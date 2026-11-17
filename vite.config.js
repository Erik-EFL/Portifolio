import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  // Em teste o plugin de react-refresh injeta $RefreshSig$ e quebra o import
  // dos módulos; o esbuild já transforma o JSX pelo tsconfig.
  plugins: mode === 'test' ? [] : [react()],
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
      // Piso = cobertura real medida (32% de linhas): o objetivo é travar
      // regressão, não fingir qualidade. Suba o piso junto com os testes.
      thresholds: {
        statements: 30,
        branches: 22,
        functions: 28,
        lines: 30
      }
    }
  }
}))

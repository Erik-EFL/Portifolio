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
        'src/test/**'
      ],
      // Piso = cobertura real medida (18% de linhas): o objetivo aqui é travar
      // regressão, não fingir qualidade. Suba o piso junto com os testes.
      thresholds: {
        statements: 17,
        branches: 16,
        functions: 13,
        lines: 17
      }
    }
  }
}))

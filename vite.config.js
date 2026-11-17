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
    css: false
  }
}))

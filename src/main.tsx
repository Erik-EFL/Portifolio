import React from 'react'
import { createRoot } from 'react-dom/client'

import 'remixicon/fonts/remixicon.css'

import { App } from './app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContextProvider } from './context/index.context'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'

const queryClient = new QueryClient()

const container = document.getElementById('root')

if (!container) {
  throw new Error('Elemento #root não encontrado em index.html.')
}

createRoot(container).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <ErrorBoundary>
        <ContextProvider>
          <App />
        </ContextProvider>
      </ErrorBoundary>
    </React.StrictMode>
  </QueryClientProvider>
)

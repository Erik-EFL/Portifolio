import React from 'react'
import { createRoot } from 'react-dom/client'

import 'remixicon/fonts/remixicon.css'

import { App } from './app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContextProvider } from './context/index.context'

const queryClient = new QueryClient()

const root = createRoot(document.getElementById('root')!)

root.render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <ContextProvider>
        <App />
      </ContextProvider>
    </React.StrictMode>
  </QueryClientProvider>
)

import React from 'react'
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query'

import 'remixicon/fonts/remixicon.css'

import Routing from './Routes/Router';

const queryClient = new QueryClient();

const root = createRoot(document.getElementById('root'))

root.render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <Routing />
    </React.StrictMode>
  </QueryClientProvider>,
)

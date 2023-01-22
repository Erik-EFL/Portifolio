import React from 'react'
import { render } from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'remixicon/fonts/remixicon.css'
import Routing from './Routes/Router';

const queryClient = new QueryClient();

render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <Routing />
    </React.StrictMode>
  </QueryClientProvider>,
  document.getElementById('root')
)

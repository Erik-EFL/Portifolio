import React, { PropsWithChildren } from 'react'
import { ThemeProvider } from './theme.context'

const providers = [ThemeProvider] as const

export const ContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return providers.reduce((prev, Provider) => {
    return <Provider>{prev}</Provider>
  }, children)
}

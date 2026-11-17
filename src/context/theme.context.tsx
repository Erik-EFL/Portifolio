import { registerServiceWorker } from '@/constant/service-worker'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import type { DefaultTheme } from 'styled-components'
import { theme as darkTheme } from '../Styles/dark-theme'
import { theme as lightTheme } from '../Styles/light-theme'

type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

interface IThemeContext {
  themeMode: ThemeMode
  switchTheme: () => void
  theme: DefaultTheme
}

export const ThemeContext = createContext({} as IThemeContext)

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark'

const getStoredThemeMode = (): ThemeMode | null => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)

    if (stored === null) return null
    if (isThemeMode(stored)) return stored

    // Versões anteriores gravavam o objeto do tema inteiro nesta chave.
    // O valor não serve como modo, então descarta para não travar o tema.
    window.localStorage.removeItem(THEME_STORAGE_KEY)
    return null
  } catch {
    return null
  }
}

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'

  const stored = getStoredThemeMode()
  if (stored) return stored

  const prefersDark =
    window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false

  return prefersDark ? 'dark' : 'light'
}

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    } catch {
      // storage indisponível (modo privado/cota): mantém só o estado em memória.
    }

    document.documentElement.dataset.theme = themeMode
    document.documentElement.style.colorScheme = themeMode
  }, [themeMode])

  useEffect(() => {
    registerServiceWorker()
  }, [])

  const switchTheme = useCallback(() => {
    setThemeMode(currentMode => (currentMode === 'light' ? 'dark' : 'light'))
  }, [])

  const theme = themeMode === 'dark' ? darkTheme : lightTheme

  const contextValue = useMemo<IThemeContext>(
    () => ({ themeMode, switchTheme, theme }),
    [themeMode, switchTheme, theme]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

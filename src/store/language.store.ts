import { useEffect, useMemo, useState } from 'react'
import { create } from 'zustand'
import { useQuery } from '@tanstack/react-query'
import { TLanguage } from '@/@types/portfolio.entity'
import { getRows, PORTFOLIO_ROWS_QUERY_KEY } from '@/services/admin-api.service'
import {
  getLocalizedPortfolioData,
  mergePortfolioRows
} from '@/services/portfolio-data.service'

interface ILanguageState {
  language: TLanguage
  changeLanguage: (language: TLanguage) => void
}

const STORAGE_KEY = 'language'
const DEFAULT_LANGUAGE: TLanguage = 'ptBR'

/** Teto para o skeleton: API que aceita conexão e não responde não segura a UI. */
const SKELETON_TIMEOUT_MS = 2500

const getStoredLanguage = (): TLanguage => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored === 'ptBR' || stored === 'enUS') return stored
  } catch (error) {
    console.error(`Error reading ${STORAGE_KEY}: ${error}`)
  }

  return DEFAULT_LANGUAGE
}

export const useLanguageStore = create<ILanguageState>()(set => {
  const initialLanguage = getStoredLanguage()

  return {
    language: initialLanguage,
    changeLanguage: language => {
      try {
        localStorage.setItem(STORAGE_KEY, language)
      } catch (error) {
        console.error(`Error setting ${STORAGE_KEY}: ${error}`)
      }

      set({ language })
    }
  }
})

export const useLanguage = () => {
  const language = useLanguageStore(state => state.language)
  const changeLanguage = useLanguageStore(state => state.changeLanguage)
  const rowsQuery = useQuery({
    queryKey: PORTFOLIO_ROWS_QUERY_KEY,
    queryFn: getRows,
    retry: false,
    // Com o modo default ('online') uma falha de rede PAUSA a query e o status
    // fica 'pending' para sempre; 'always' faz a falha virar erro de verdade.
    networkMode: 'always',
    // Conteúdo tem fallback estático: uma busca por carga, refeita só no
    // botão "Retry".
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000
  })

  // Skeleton só no primeiro carregamento e só uma vez: derivar "carregando" do
  // estado da query fazia a página oscilar para sempre (montar o conteúdo
  // assina o observer, o observer busca, a busca remonta o conteúdo...).
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    if (!rowsQuery.isPending) {
      setBootstrapped(true)
      return
    }

    const timeout = setTimeout(() => setBootstrapped(true), SKELETON_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [rowsQuery.isPending])

  const data = useMemo(
    () =>
      getLocalizedPortfolioData(
        mergePortfolioRows(rowsQuery.data ?? []),
        language
      ),
    [rowsQuery.data, language]
  )

  return {
    language,
    changeLanguage,
    data,
    isLoading: !bootstrapped,
    error: rowsQuery.error,
    retry: rowsQuery.refetch
  }
}

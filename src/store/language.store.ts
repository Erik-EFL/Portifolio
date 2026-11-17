import { create } from 'zustand'
import { useQuery } from '@tanstack/react-query'
import { TLanguage } from '@/@types/data-tipe.entity'
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
    retry: false
  })
  const data = getLocalizedPortfolioData(
    mergePortfolioRows(rowsQuery.data ?? []),
    language
  )

  return {
    language,
    changeLanguage,
    data,
    // `isPending` sozinho prende a página no skeleton quando a retentativa do
    // react-query pausa (API fora do ar, aba sem foco): o fetch fica 'paused'
    // em vez de falhar. Sem fetch em andamento, mostramos o conteúdo estático.
    isLoading: rowsQuery.isPending && rowsQuery.fetchStatus === 'fetching',
    error: rowsQuery.error,
    retry: rowsQuery.refetch
  }
}

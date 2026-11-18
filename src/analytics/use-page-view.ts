import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguageStore } from '@/store/language.store'
import { resolveAnalyticsPath, trackPageView } from './page-view'

/**
 * Um pageview por rota visitada. Montado no layout público (dentro do router),
 * não em cada página: assim uma rota nova já entra na contagem sem ninguém
 * lembrar de chamar nada.
 */
export const usePageView = (): void => {
  const { pathname } = useLocation()

  useEffect(() => {
    const path = resolveAnalyticsPath(pathname, import.meta.env.BASE_URL)
    if (!path) return

    // Idioma lido na hora do acesso (e não como dependência): trocar de idioma
    // não é uma visita nova, senão quem aperta o botão contaria duas vezes.
    const { language } = useLanguageStore.getState()
    void trackPageView({ path, language })
  }, [pathname])
}

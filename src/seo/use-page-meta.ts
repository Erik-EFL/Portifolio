import { useEffect } from 'react'
import { useLanguage } from '@/store/language.store'
import { applyPageMeta, type LocalizedPageMeta } from './page-meta'

/**
 * Aplica as metas da página no idioma ativo. Passe um objeto estável (constante
 * de módulo) — dentro do componente ele reexecutaria a cada render.
 */
export function usePageMeta(meta: LocalizedPageMeta, path: string) {
  const { language } = useLanguage()

  useEffect(() => {
    applyPageMeta(meta[language] ?? meta.ptBR, path, language)
  }, [meta, language, path])
}

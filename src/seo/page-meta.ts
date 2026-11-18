import type { TLanguage } from '@/@types/portfolio.entity'

/**
 * Endereço público do site. O default é o endereço do GitHub Pages; defina
 * VITE_SITE_URL para usar domínio próprio. canonical, og:url e sitemap saem
 * daqui — por isso tudo é absoluto.
 */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://erik-efl.github.io/Portifolio'
).replace(/\/+$/, '')

export const SITE_NAME = 'Erik Ferreira Lima'

export interface PageMeta {
  /** Vai inteiro no `<title>` (inclua o nome: as abas precisam se distinguir). */
  title: string
  description: string
  /** Painel administrativo não deve ser indexado. */
  noIndex?: boolean
}

export type LocalizedPageMeta = Record<TLanguage, PageMeta>

/** `/skills` -> `https://site/skills` (sem barra dupla na raiz). */
export function absoluteUrl(path: string): string {
  if (path === '/' || path === '') return `${SITE_URL}/`
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function setMeta(
  doc: Document,
  attr: 'name' | 'property',
  key: string,
  content: string
) {
  let element = doc.head.querySelector(`meta[${attr}="${key}"]`)

  if (!element) {
    element = doc.createElement('meta')
    element.setAttribute(attr, key)
    doc.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function setCanonical(doc: Document, href: string) {
  let link = doc.head.querySelector('link[rel="canonical"]')

  if (!link) {
    link = doc.createElement('link')
    link.setAttribute('rel', 'canonical')
    doc.head.appendChild(link)
  }

  link.setAttribute('href', href)
}

/**
 * Troca título, description, canonical e as tags sociais da rota atual.
 *
 * SPA entrega uma única página estática ao crawler; sem isso as quatro rotas
 * apareciam no Google com o mesmo título e sem canonical — o que, com conteúdo
 * duplicado, faz o buscador escolher sozinho qual URL indexar.
 */
export function applyPageMeta(
  meta: PageMeta,
  path: string,
  language: TLanguage = 'ptBR',
  doc: Document = document
) {
  const url = absoluteUrl(path)
  const isEnglish = language === 'enUS'

  // O idioma do documento é sinal de idioma para o buscador; deixá-lo fixo em
  // pt-BR com a página em inglês faz o Google tratar o inglês como tradução.
  doc.documentElement.lang = isEnglish ? 'en' : 'pt-BR'

  doc.title = meta.title

  setMeta(doc, 'property', 'og:locale', isEnglish ? 'en_US' : 'pt_BR')
  setMeta(doc, 'name', 'description', meta.description)
  setMeta(
    doc,
    'name',
    'robots',
    meta.noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large'
  )

  setMeta(doc, 'property', 'og:title', meta.title)
  setMeta(doc, 'property', 'og:description', meta.description)
  setMeta(doc, 'property', 'og:url', url)
  setMeta(doc, 'name', 'twitter:title', meta.title)
  setMeta(doc, 'name', 'twitter:description', meta.description)

  setCanonical(doc, url)
}

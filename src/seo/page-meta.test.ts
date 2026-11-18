import { beforeEach, describe, expect, it } from 'vitest'
import {
  absoluteUrl,
  applyPageMeta,
  SITE_URL,
  type PageMeta
} from './page-meta'

const meta: PageMeta = {
  title: 'Habilidades | Erik Ferreira Lima',
  description: 'Stack de Erik Ferreira Lima.'
}

const content = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute('content')

describe('absoluteUrl', () => {
  it('monta a raiz sem barra dupla', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`)
    expect(absoluteUrl('')).toBe(`${SITE_URL}/`)
  })

  it('monta rotas internas', () => {
    expect(absoluteUrl('/skills')).toBe(`${SITE_URL}/skills`)
    expect(absoluteUrl('projects')).toBe(`${SITE_URL}/projects`)
  })
})

describe('applyPageMeta', () => {
  beforeEach(() => {
    // estado inicial parecido com o index.html servido pelo build
    document.head.innerHTML = `
      <title>Erik Ferreira Lima | Desenvolvedor Full Stack JavaScript</title>
      <meta name="description" content="descrição antiga" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta property="og:title" content="og antigo" />
      <meta property="og:url" content="https://antigo/" />
      <meta name="twitter:title" content="twitter antigo" />
      <link rel="canonical" href="https://antigo/" />
    `
  })

  it('troca título, description e canonical da rota', () => {
    applyPageMeta(meta, '/skills')

    expect(document.title).toBe('Habilidades | Erik Ferreira Lima')
    expect(content('meta[name="description"]')).toBe(
      'Stack de Erik Ferreira Lima.'
    )
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')
    ).toBe(`${SITE_URL}/skills`)
  })

  it('mantém as tags sociais coerentes com a rota (sem duplicar)', () => {
    applyPageMeta(meta, '/skills')

    expect(content('meta[property="og:title"]')).toBe(meta.title)
    expect(content('meta[property="og:url"]')).toBe(`${SITE_URL}/skills`)
    expect(content('meta[name="twitter:title"]')).toBe(meta.title)
    expect(
      document.head.querySelectorAll('meta[property="og:title"]')
    ).toHaveLength(1)
    expect(
      document.head.querySelectorAll('link[rel="canonical"]')
    ).toHaveLength(1)
  })

  it('cria as tags que não existiam no head', () => {
    document.head.innerHTML = '<title>inicial</title>'

    applyPageMeta(meta, '/projects')

    expect(content('meta[property="og:description"]')).toBe(meta.description)
    expect(content('meta[name="twitter:description"]')).toBe(meta.description)
    expect(document.head.querySelector('link[rel="canonical"]')).not.toBeNull()
  })

  it('acompanha o idioma no html lang e no og:locale', () => {
    applyPageMeta(meta, '/skills', 'enUS')

    expect(document.documentElement.lang).toBe('en')
    expect(content('meta[property="og:locale"]')).toBe('en_US')

    applyPageMeta(meta, '/skills', 'ptBR')

    expect(document.documentElement.lang).toBe('pt-BR')
    expect(content('meta[property="og:locale"]')).toBe('pt_BR')
  })

  it('marca noindex e desfaz ao voltar para uma rota pública', () => {
    applyPageMeta({ ...meta, noIndex: true }, '/admin')
    expect(content('meta[name="robots"]')).toBe('noindex, nofollow')

    applyPageMeta(meta, '/skills')
    expect(content('meta[name="robots"]')).toBe(
      'index, follow, max-image-preview:large'
    )
  })
})

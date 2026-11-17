export type TLanguage = 'ptBR' | 'enUS'

export interface NavigationLink {
  name: string
  link: string
}

export interface FooterItem {
  copyright: string
}

export interface HomeContent {
  circle: string
  name: string
  title: string
  description: string[]
  link: string
}

export interface AboutContent {
  description: string[]
}

/** Texto por idioma; ausência de uma chave significa "usa o texto base". */
export type LocalizedText = Partial<Record<TLanguage, string>>

/**
 * Skill é conteúdo de UMA fonte só: `name` é o texto base (ptBR) e vale também
 * para o inglês. `translations` só existe quando o nome muda de idioma
 * ("Boa comunicação" x "Good communication"); "React" não tem tradução.
 */
export interface Skill {
  name: string
  level?: number
  translations?: LocalizedText
}

export interface SkillCategory {
  title: string
  skills: Skill[]
  translations?: LocalizedText
}

export interface LocalizedSection<DataType> {
  language: TLanguage
  items: DataType[]
}

/**
 * Formato bruto de src/constant/Data/data.json:
 * cada seção é uma lista de LocalizedSection (uma por idioma).
 */
export interface IData {
  navigation: LocalizedSection<NavigationLink>[]
  footer: LocalizedSection<NavigationLink>[]
  footerCopyright: LocalizedSection<FooterItem>[]
  home: LocalizedSection<HomeContent>[]
  about: LocalizedSection<AboutContent>[]
  /**
   * Skills são lista única (uma fonte de verdade) — as outras seções seguem
   * duplicadas por idioma, mas skill não: cada entrada tem um texto base e, se
   * precisar, a tradução embutida.
   */
  skills: SkillCategory[]
  skillsDetails: SkillCategory[]
}

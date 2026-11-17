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

export interface Skill {
  name: string
  level?: number
}

export interface SkillCategory {
  title: string
  skills: Skill[]
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
  skills: LocalizedSection<SkillCategory>[]
  skillsDetails: LocalizedSection<SkillCategory>[]
}

/**
 * Dados já resolvidos para o idioma atual.
 * Montado pela store de idioma (src/store/language.store.ts) via services.
 */
export interface MyObject {
  navigation: NavigationLink[]
  footer: NavigationLink[]
  footerCopyright: FooterItem[]
  about: string[]
  home: HomeContent
  skills: SkillCategory[]
  skillsDetails: SkillCategory[]
}

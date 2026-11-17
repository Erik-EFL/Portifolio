import type {
  LocalizedText,
  LocalizedSection,
  Skill,
  SkillCategory,
  TLanguage
} from '@/@types/portfolio.entity'
import { isRecord } from '@/utils/is-record'

/**
 * Skills têm UMA fonte de verdade: uma lista só, com o texto base em português
 * e a tradução opcional embutida em cada entrada. Antes eram dois blocos
 * (ptBR/enUS) que desalinhavam com facilidade — uma categoria criada em um
 * idioma simplesmente não existia no outro.
 *
 * `name`/`title` é o texto base e vale para os dois idiomas; `translations` só
 * entra quando o texto muda ("Boa comunicação" x "Good communication").
 */
export const SKILLS_SECTIONS = ['skills', 'skillsDetails'] as const

export type SkillsSectionKey = (typeof SKILLS_SECTIONS)[number]

export const isSkillsSection = (key: string): key is SkillsSectionKey =>
  SKILLS_SECTIONS.includes(key as SkillsSectionKey)

export const SKILL_LANGUAGES: TLanguage[] = ['ptBR', 'enUS']

/** Texto no idioma pedido, caindo no base quando não há tradução. */
export const resolveText = (
  base: string,
  translations: LocalizedText | undefined,
  language: TLanguage
): string => {
  const traduzido = translations?.[language]?.trim()
  return traduzido || base
}

const readLocalizedText = (value: unknown): LocalizedText | undefined => {
  if (!isRecord(value)) return undefined

  const text: LocalizedText = {}
  for (const language of SKILL_LANGUAGES) {
    if (typeof value[language] === 'string') text[language] = value[language]
  }

  return Object.keys(text).length > 0 ? text : undefined
}

const readSkill = (value: unknown): Skill | undefined => {
  if (!isRecord(value) || typeof value.name !== 'string') return undefined

  return {
    name: value.name,
    ...(typeof value.level === 'number' ? { level: value.level } : {}),
    ...(readLocalizedText(value.translations)
      ? { translations: readLocalizedText(value.translations) }
      : {})
  }
}

const readCategory = (value: unknown): SkillCategory | undefined => {
  if (!isRecord(value) || typeof value.title !== 'string') return undefined
  if (!Array.isArray(value.skills)) return undefined

  const skills = value.skills.map(readSkill)

  // skill malformada invalida a categoria: descartar em silêncio apagaria
  // conteúdo no próximo save do admin
  if (skills.some(skill => skill === undefined)) return undefined

  return {
    title: value.title,
    skills: skills as Skill[],
    ...(readLocalizedText(value.translations)
      ? { translations: readLocalizedText(value.translations) }
      : {})
  }
}

const isLocalizedSection = (
  value: unknown
): value is LocalizedSection<SkillCategory> =>
  isRecord(value) &&
  (value.language === 'ptBR' || value.language === 'enUS') &&
  Array.isArray(value.items)

/**
 * Formato antigo (um bloco por idioma) → lista única. ptBR é a base; o texto do
 * enUS vira `translations.enUS` quando difere. Skill que só existia em um dos
 * idiomas é preservada (o que sobra aparece na lista única).
 */
const fromLocalizedSections = (
  sections: LocalizedSection<SkillCategory>[]
): SkillCategory[] => {
  const pt = sections.find(section => section.language === 'ptBR')?.items ?? []
  const en = sections.find(section => section.language === 'enUS')?.items ?? []
  const base = pt.length >= en.length ? pt : en
  const outro = pt.length >= en.length ? en : pt
  const outroIdioma: TLanguage = pt.length >= en.length ? 'enUS' : 'ptBR'

  return base.map((categoria, index) => {
    const espelho = outro[index]

    return {
      title: categoria.title,
      skills: categoria.skills.map((skill, skillIndex) => {
        const nomeEspelho = espelho?.skills?.[skillIndex]?.name?.trim()

        return {
          ...skill,
          ...(nomeEspelho && nomeEspelho !== skill.name
            ? { translations: { [outroIdioma]: nomeEspelho } }
            : {})
        }
      }),
      ...(espelho?.title?.trim() && espelho.title.trim() !== categoria.title
        ? { translations: { [outroIdioma]: espelho.title.trim() } }
        : {})
    }
  })
}

/**
 * Aceita os dois formatos e devolve sempre a lista única. O formato antigo é
 * migrado na leitura, então uma linha que ainda está no banco com dois blocos
 * continua funcionando — e ao salvar pelo admin já é gravada no formato novo.
 */
export const normalizeSkillCategories = (
  value: unknown
): SkillCategory[] | undefined => {
  if (!Array.isArray(value)) return undefined

  if (value.some(isLocalizedSection)) {
    return fromLocalizedSections(value.filter(isLocalizedSection))
  }

  const categories = value
    .map(readCategory)
    .filter((category): category is SkillCategory => category !== undefined)

  // lista com itens inválidos é conteúdo inválido, não lista parcial
  return categories.length === value.length ? categories : undefined
}

/** Aplica o idioma nas categorias (o que as telas consomem). */
export const resolveSkillCategories = (
  categories: SkillCategory[],
  language: TLanguage
): SkillCategory[] =>
  categories.map(category => ({
    ...category,
    title: resolveText(category.title, category.translations, language),
    skills: category.skills.map(skill => ({
      ...skill,
      name: resolveText(skill.name, skill.translations, language)
    }))
  }))

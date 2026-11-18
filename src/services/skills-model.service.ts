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
  if (traduzido) return traduzido

  const baseLimpa = base?.trim()
  if (baseLimpa) return base

  // Base em branco: o conteúdo antigo (dois blocos por idioma) deixou
  // placeholders sem texto porque o nome só existia no outro bloco. Mostrar o
  // texto que existe é melhor que renderizar uma linha vazia.
  const outroIdioma = SKILL_LANGUAGES.map(item =>
    translations?.[item]?.trim()
  ).find(texto => Boolean(texto))

  return outroIdioma ?? base
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
 * Formato antigo (um bloco por idioma) → lista única.
 *
 * A lista do bloco ptBR é a ÚNICA fonte: os nomes de skill/ferramenta já são em
 * inglês nos dois blocos, então copiar a composição do enUS só criava
 * divergência (Bootstrap/Figma existiam apenas lá, Zustand/jotai apenas aqui) e
 * a página mostrava listas diferentes por idioma. Do enUS aproveitamos somente
 * o título da categoria ("Ferramentas" → "Tools"), que é texto de interface.
 * Nome traduzido só vale no formato novo, com `translations` explícito.
 */
const fromLocalizedSections = (
  sections: LocalizedSection<SkillCategory>[]
): SkillCategory[] => {
  const pt = sections.find(section => section.language === 'ptBR')?.items ?? []
  const en = sections.find(section => section.language === 'enUS')?.items ?? []
  // linha que só tem o bloco enUS continua válida: ele vira a lista
  const base = pt.length > 0 ? pt : en
  const titulosEmIngles = pt.length > 0 ? en : []

  return base.map((categoria, index) => {
    const tituloEspelho = titulosEmIngles[index]?.title?.trim()

    return {
      title: categoria.title,
      skills: categoria.skills
        // lugar vazio no bloco não vira linha em branco no card (e não repete
        // a key "")
        .filter(skill => (skill.name?.trim() ?? '') !== '')
        .map(skill => ({ ...skill, name: skill.name.trim() })),
      ...(tituloEspelho && tituloEspelho !== categoria.title
        ? { translations: { enUS: tituloEspelho } }
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
    skills: category.skills
      .map(skill => ({
        ...skill,
        name: resolveText(skill.name, skill.translations, language)
      }))
      // Sem texto em nenhum idioma não há o que mostrar: a linha em branco só
      // consome célula do grid e repete a mesma `key` (o React perde a conta
      // das linhas e deixa nós órfãos).
      .filter(skill => skill.name.trim() !== '')
  }))

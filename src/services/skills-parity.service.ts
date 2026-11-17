import type {
  LocalizedSection,
  SkillCategory,
  TLanguage
} from '@/@types/portfolio.entity'
import { isRecord } from '@/utils/is-record'

/**
 * Seções em que cada skill é conteúdo traduzido: a lista do ptBR e a do enUS
 * precisam ter a mesma forma (mesmas categorias, na mesma ordem, com a mesma
 * quantidade de skills). Os nomes e títulos mudam de idioma; a estrutura, não.
 *
 * Sem essa regra, adicionar uma skill em um idioma só faz o outro ficar com uma
 * categoria a menos (foi assim que "Soft Skills" apareceu só no inglês em
 * skillsDetails).
 */
export const SKILLS_PARITY_SECTIONS = ['skills', 'skillsDetails'] as const

export type SkillsParitySectionKey = (typeof SKILLS_PARITY_SECTIONS)[number]

export const isSkillsParitySection = (
  key: string
): key is SkillsParitySectionKey =>
  SKILLS_PARITY_SECTIONS.includes(key as SkillsParitySectionKey)

export const PARITY_LANGUAGES: TLanguage[] = ['ptBR', 'enUS']

export interface ISkillsParityIssue {
  /** Categoria (ou "categoria N") onde a divergência aparece. */
  category: string
  detail: string
}

const readSections = (value: unknown): LocalizedSection<SkillCategory>[] =>
  Array.isArray(value)
    ? value.filter(
        (section): section is LocalizedSection<SkillCategory> =>
          isRecord(section) && Array.isArray(section.items)
      )
    : []

const itemsOf = (
  sections: LocalizedSection<SkillCategory>[],
  language: TLanguage
): SkillCategory[] =>
  sections.find(section => section.language === language)?.items ?? []

const skillsOf = (category: SkillCategory | undefined): number =>
  Array.isArray(category?.skills) ? category.skills.length : 0

const titleOf = (category: SkillCategory | undefined, index: number): string =>
  category?.title?.trim() ? category.title.trim() : `categoria ${index + 1}`

/**
 * Lista o que diverge entre os idiomas. Vazio = as duas versões têm a mesma
 * forma e a seção pode ser salva.
 */
export const getSkillsParityIssues = (value: unknown): ISkillsParityIssue[] => {
  const sections = readSections(value)
  const porIdioma = PARITY_LANGUAGES.map(language => ({
    language,
    items: itemsOf(sections, language)
  }))

  const faltando = porIdioma.filter(item => item.items.length === 0)

  if (faltando.length > 0) {
    return [
      {
        category: 'seção',
        detail: `Sem bloco de conteúdo para: ${faltando
          .map(item => item.language)
          .join(', ')}.`
      }
    ]
  }

  const [ptBR, enUS] = porIdioma

  // Com quantidades diferentes não dá para comparar categoria a categoria (a
  // lista desloca e "Front-end" passaria a ser comparado com outra categoria).
  // Uma diferença só, dizendo o tamanho de cada bloco, é mais útil que N falsos
  // positivos.
  if (ptBR.items.length !== enUS.items.length) {
    return [
      {
        category: 'categorias',
        detail: `ptBR tem ${ptBR.items.length} categoria(s) e enUS tem ${enUS.items.length}. Igualar idiomas acrescenta as que faltam no fim — confira a ordem depois.`
      }
    ]
  }

  const issues: ISkillsParityIssue[] = []

  for (let index = 0; index < ptBR.items.length; index += 1) {
    const categoriaPt = ptBR.items[index]
    const totalPt = skillsOf(categoriaPt)
    const totalEn = skillsOf(enUS.items[index])

    if (totalPt !== totalEn) {
      issues.push({
        category: titleOf(categoriaPt, index),
        detail: `ptBR tem ${totalPt} skill(s) e enUS tem ${totalEn} — inclua a que falta na outra versão.`
      })
    }
  }

  return issues
}

const padItems = <Item>(
  items: Item[],
  total: number,
  empty: () => Item
): Item[] =>
  total <= items.length
    ? items
    : [...items, ...Array.from({ length: total - items.length }, empty)]

/**
 * Completa o idioma que ficou para trás: cria a categoria que só existe no outro
 * e acrescenta as skills faltantes (com nome vazio, para preencher). Não apaga
 * nada — o que sobra é a pessoa que decide.
 */
export const alignSkillsSections = (value: unknown): unknown => {
  if (!Array.isArray(value)) return value

  const sections = readSections(value)
  const itemsByLanguage = new Map<TLanguage, SkillCategory[]>(
    PARITY_LANGUAGES.map(language => [language, itemsOf(sections, language)])
  )
  const totalCategorias = Math.max(
    ...PARITY_LANGUAGES.map(
      language => itemsByLanguage.get(language)?.length ?? 0
    )
  )

  const alinhado = new Map<TLanguage, SkillCategory[]>()

  for (const language of PARITY_LANGUAGES) {
    const items = itemsByLanguage.get(language) ?? []
    const base = padItems(items, totalCategorias, () => ({
      title: '',
      skills: []
    }))

    alinhado.set(
      language,
      base.map((categoria, index) => {
        const skills = Array.isArray(categoria.skills) ? categoria.skills : []
        const totalSkills = Math.max(
          ...PARITY_LANGUAGES.map(
            outro => itemsByLanguage.get(outro)?.[index]?.skills?.length ?? 0
          )
        )

        return {
          ...categoria,
          skills: padItems(skills, totalSkills, () => ({ name: '' }))
        }
      })
    )
  }

  // Mantém a ordem original dos blocos (e qualquer bloco de outro idioma).
  return value.map(bloco => {
    if (!isRecord(bloco)) return bloco

    const language = bloco.language as TLanguage
    const itens = alinhado.get(language)

    return itens ? { ...bloco, items: itens } : bloco
  })
}

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
 * Formato antigo (um bloco por idioma) → lista única. O bloco ptBR é a base; o
 * texto do outro idioma vira `translations` quando difere. Skill que só existia
 * em um dos idiomas é preservada (entra no fim, sem tradução inventada).
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
    const skillsEspelho = espelho?.skills ?? []
    const nomesBase = categoria.skills.map(skill => skill.name?.trim() ?? '')
    const nomesEspelho = skillsEspelho.map(skill => skill.name?.trim() ?? '')

    // O índice só pareia com segurança quando os dois blocos descrevem a MESMA
    // lista. Com lugar vazio ou tamanho diferente o índice desalinha e inventa
    // tradução ("Prisma" virando "TypeORM"), então nesse caso não pareia nada.
    const pareavel =
      nomesBase.length === nomesEspelho.length &&
      nomesBase.every(Boolean) &&
      nomesEspelho.every(Boolean)

    const skills = categoria.skills
      .map((skill, skillIndex) => {
        const nome = nomesBase[skillIndex]
        // lugar vazio não vira linha em branco no card (e não repete a key "")
        if (!nome) return undefined

        const nomeEspelho = nomesEspelho[skillIndex]

        return {
          ...skill,
          name: nome,
          ...(pareavel && nomeEspelho && nomeEspelho !== nome
            ? { translations: { [outroIdioma]: nomeEspelho } }
            : {})
        }
      })
      .filter((skill): skill is Skill => skill !== undefined)

    // nome que só existe no outro bloco não se perde: entra no fim da lista.
    // O que já está na lista como texto base ou como tradução não duplica.
    const conhecidos = new Set<string>()
    skills.forEach(skill => {
      conhecidos.add(skill.name)
      Object.values(skill.translations ?? {}).forEach(texto =>
        conhecidos.add(texto)
      )
    })

    skillsEspelho.forEach((skill, skillIndex) => {
      const nome = nomesEspelho[skillIndex]
      if (!nome || conhecidos.has(nome)) return
      conhecidos.add(nome)
      skills.push({ ...skill, name: nome })
    })

    return {
      title: categoria.title,
      skills,
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

import type {
  AboutContent,
  FooterItem,
  HomeContent,
  IData,
  LocalizedSection,
  NavigationLink,
  Skill,
  SkillCategory,
  TLanguage
} from '@/@types/portfolio.entity'
import aboutData from '@/constant/Data/About.data'
import staticData from '@/constant/Data/data.json'
import { isRecord } from '@/utils/is-record'

export const DATA_SECTION_KEYS = [
  'navigation',
  'footer',
  'footerCopyright',
  'home',
  'about',
  'skills',
  'skillsDetails'
] as const

export type DataSectionKey = (typeof DATA_SECTION_KEYS)[number]

type DataRowBase = { _id?: string }

export type DataRow =
  | (DataRowBase & { key: 'navigation'; value: IData['navigation'] })
  | (DataRowBase & { key: 'footer'; value: IData['footer'] })
  | (DataRowBase & { key: 'footerCopyright'; value: IData['footerCopyright'] })
  | (DataRowBase & { key: 'home'; value: IData['home'] })
  | (DataRowBase & { key: 'about'; value: IData['about'] })
  | (DataRowBase & { key: 'skills'; value: IData['skills'] })
  | (DataRowBase & { key: 'skillsDetails'; value: IData['skillsDetails'] })

export type CreateDataRow = {
  key: DataSectionKey
  value: IData[DataSectionKey]
}

const isString = (value: unknown): value is string => typeof value === 'string'

const isLanguage = (value: unknown): value is TLanguage =>
  value === 'ptBR' || value === 'enUS'

const isNavigationLink = (value: unknown): value is NavigationLink =>
  isRecord(value) && isString(value.name) && isString(value.link)

const isFooterItem = (value: unknown): value is FooterItem =>
  isRecord(value) && isString(value.copyright)

const isHomeContent = (value: unknown): value is HomeContent =>
  isRecord(value) &&
  isString(value.circle) &&
  isString(value.name) &&
  isString(value.title) &&
  Array.isArray(value.description) &&
  value.description.every(isString) &&
  isString(value.link)

const isAboutContent = (value: unknown): value is AboutContent =>
  isRecord(value) &&
  Array.isArray(value.description) &&
  value.description.every(isString)

const isSkill = (value: unknown): value is Skill =>
  isRecord(value) &&
  isString(value.name) &&
  (value.level === undefined || typeof value.level === 'number')

const isSkillCategory = (value: unknown): value is SkillCategory =>
  isRecord(value) &&
  isString(value.title) &&
  Array.isArray(value.skills) &&
  value.skills.every(isSkill)

const isLocalizedSections = <Item>(
  value: unknown,
  isItem: (item: unknown) => item is Item
): value is LocalizedSection<Item>[] =>
  Array.isArray(value) &&
  value.every(
    section =>
      isRecord(section) &&
      isLanguage(section.language) &&
      Array.isArray(section.items) &&
      section.items.every(isItem)
  )

export const parseDataRow = (
  key: unknown,
  value: unknown,
  id?: string
): DataRow | undefined => {
  const rowId = isString(id) ? { _id: id } : {}

  switch (key) {
    case 'navigation':
      return isLocalizedSections(value, isNavigationLink)
        ? { ...rowId, key, value }
        : undefined
    case 'footer':
      return isLocalizedSections(value, isNavigationLink)
        ? { ...rowId, key, value }
        : undefined
    case 'footerCopyright':
      return isLocalizedSections(value, isFooterItem)
        ? { ...rowId, key, value }
        : undefined
    case 'home':
      return isLocalizedSections(value, isHomeContent)
        ? { ...rowId, key, value }
        : undefined
    case 'about':
      return isLocalizedSections(value, isAboutContent)
        ? { ...rowId, key, value }
        : undefined
    case 'skills':
      return isLocalizedSections(value, isSkillCategory)
        ? { ...rowId, key, value }
        : undefined
    case 'skillsDetails':
      return isLocalizedSections(value, isSkillCategory)
        ? { ...rowId, key, value }
        : undefined
    default:
      return undefined
  }
}

const fallbackCandidate: unknown = {
  ...staticData,
  about: [
    { language: 'ptBR', items: [{ description: aboutData.ptBR }] },
    { language: 'enUS', items: [{ description: aboutData.enUS }] }
  ]
}

const isIData = (value: unknown): value is IData =>
  isRecord(value) &&
  DATA_SECTION_KEYS.every(key => parseDataRow(key, value[key]) !== undefined)

if (!isIData(fallbackCandidate)) {
  throw new Error('Static portfolio content does not match the IData schema.')
}

export const STATIC_PORTFOLIO_DATA = fallbackCandidate

export const parseDataRows = (input: unknown): DataRow[] => {
  // The Functions API answers with a flat array; tolerate the raw appbackend
  // envelope too, so a partially deployed backend does not break the client.
  const list = Array.isArray(input)
    ? input
    : isRecord(input) && Array.isArray(input.data)
    ? input.data
    : null

  if (!list) {
    throw new Error('The rows API response must be an array.')
  }

  const rows: DataRow[] = []

  list.forEach((value, index) => {
    if (!isRecord(value)) {
      throw new Error(
        `The rows API response contains an invalid row at index ${index}.`
      )
    }

    if (!DATA_SECTION_KEYS.some(key => key === value.key)) return

    if (value._id !== undefined && typeof value._id !== 'string') {
      throw new Error(
        `The rows API response contains an invalid row ID at index ${index}.`
      )
    }

    const row = parseDataRow(value.key, value.value, value._id)
    if (!row) {
      throw new Error(
        `The rows API response contains invalid section data at index ${index}.`
      )
    }
    rows.push(row)
  })

  return rows
}

export const mergePortfolioRows = (rows: DataRow[]): IData => {
  const merged: IData = { ...STATIC_PORTFOLIO_DATA }

  rows.forEach(row => {
    switch (row.key) {
      case 'navigation':
        merged.navigation = row.value
        break
      case 'footer':
        merged.footer = row.value
        break
      case 'footerCopyright':
        merged.footerCopyright = row.value
        break
      case 'home':
        merged.home = row.value
        break
      case 'about':
        merged.about = row.value
        break
      case 'skills':
        merged.skills = row.value
        break
      case 'skillsDetails':
        merged.skillsDetails = row.value
        break
      default: {
        const exhaustiveCheck: never = row
        return exhaustiveCheck
      }
    }
  })

  return merged
}

const sectionItems = <Item>(
  sections: LocalizedSection<Item>[],
  language: TLanguage
): Item[] =>
  sections.find(section => section.language === language)?.items ?? []

export const getLocalizedPortfolioData = (data: IData, language: TLanguage) => {
  const home = sectionItems(data.home, language)[0] ?? {
    circle: '',
    name: '',
    title: '',
    description: [],
    link: ''
  }

  return {
    navigation: sectionItems(data.navigation, language),
    footer: sectionItems(data.footer, language),
    footerCopyright: sectionItems(data.footerCopyright, language),
    home,
    about:
      sectionItems(data.about, language)[0]?.description ?? aboutData[language],
    skills: sectionItems(data.skills, language),
    skillsDetails: sectionItems(data.skillsDetails, language)
  }
}

export const validateSectionDocument = (
  key: DataSectionKey,
  input: unknown
): DataRow | undefined => {
  if (!isRecord(input)) return undefined

  const rootKeys = Object.keys(input)
  if (rootKeys.length !== 1 || rootKeys[0] !== key) return undefined

  return parseDataRow(key, input[key])
}

export const createSectionDocument = (
  key: DataSectionKey,
  value: IData[DataSectionKey]
): string => JSON.stringify({ [key]: value }, null, 2)

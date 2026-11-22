import type { TLanguage } from '@/@types/portfolio.entity'

/**
 * Data de nascimento usada pelo script de idade.
 * A idade NUNCA é gravada no conteúdo: é calculada a cada render, então o
 * texto do "Sobre mim" não envelhece sozinho.
 */
export const BIRTH_DATE = '1995-04-11'

export type PeriodOfDay = 'morning' | 'afternoon' | 'night' | 'lateNight'

const GREETINGS: Record<TLanguage, Record<PeriodOfDay, string>> = {
  ptBR: {
    morning: 'bom dia',
    afternoon: 'boa tarde',
    night: 'boa noite',
    lateNight: 'boa madrugada'
  },
  enUS: {
    morning: 'good morning',
    afternoon: 'good afternoon',
    night: 'good evening',
    lateNight: 'good night'
  }
}

/** Faixas em hora local do visitante: 6–12 manhã, 12–18 tarde, 18–24 noite, 0–6 madrugada. */
export const getPeriodOfDay = (now: Date = new Date()): PeriodOfDay => {
  const hour = now.getHours()

  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18) return 'night'
  return 'lateNight'
}

export const getGreeting = (
  language: TLanguage,
  now: Date = new Date()
): string => (GREETINGS[language] ?? GREETINGS.ptBR)[getPeriodOfDay(now)]

/**
 * Idade em anos completos. A data é montada com os componentes locais de
 * propósito: `new Date('1995-04-11')` é meia-noite UTC e, em UTC-3, cai no dia
 * 10 — o cálculo errava a idade no próprio dia do aniversário.
 */
export const calculateAge = (
  birthDate: string = BIRTH_DATE,
  today: Date = new Date()
): number => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)

  if (!match) {
    throw new Error(
      `Invalid birth date "${birthDate}": expected the YYYY-MM-DD format.`
    )
  }

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const birth = new Date(year, month, day)

  if (Number.isNaN(birth.getTime())) {
    throw new Error(`Invalid birth date "${birthDate}".`)
  }

  if (birth.getTime() > today.getTime()) {
    throw new Error(`Birth date "${birthDate}" is in the future.`)
  }

  let age = today.getFullYear() - birth.getFullYear()
  const months = today.getMonth() - birth.getMonth()

  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return age
}

type ScriptKind = 'greeting' | 'age'

/**
 * Placeholders reconhecidos no texto do "Sobre mim".
 *
 * O primeiro da lista vence quando dois casam na mesma posição (o específico
 * é mais longo que o genérico). A comparação ignora caixa e acento, então
 * "O Script da Idade Vai Aqui" também casa.
 *
 * As variantes entre aspas existem porque o texto do admin escreve
 * `"aqui vai o javascript"`: a aspa faz parte do placeholder e sai junto com
 * ele, senão a tela mostraria `"boa tarde"`.
 */
const SCRIPT_TOKENS: { pattern: string; kind: ScriptKind | 'generic' }[] = [
  { pattern: 'o script da idade vai aqui', kind: 'age' },
  { pattern: 'o script da saudacao vai aqui', kind: 'greeting' },
  { pattern: '"aqui vai o javascript"', kind: 'generic' },
  { pattern: '“aqui vai o javascript”', kind: 'generic' },
  { pattern: "'aqui vai o javascript'", kind: 'generic' },
  { pattern: '{{idade}}', kind: 'age' },
  { pattern: '{{age}}', kind: 'age' },
  { pattern: '{{saudacao}}', kind: 'greeting' },
  { pattern: '{{greeting}}', kind: 'greeting' },
  { pattern: 'o script vai aqui', kind: 'generic' },
  { pattern: 'aqui vai o javascript', kind: 'generic' }
]

const SENTENCE_END = /[.!?…]/

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1)

/** O placeholder abre uma frase? Então a saudação sai com maiúscula. */
const startsSentence = (text: string, start: number): boolean => {
  for (let index = start - 1; index >= 0; index -= 1) {
    if (/\s/.test(text[index])) continue

    return SENTENCE_END.test(text[index])
  }

  return true
}

const COMBINING_MARKS = /[\u0300-\u036f]/g

/**
 * Versão sem acento e em minúsculas + o mapa de cada índice normalizado para o
 * índice no texto original (necessário porque a normalização pode mudar o
 * comprimento de um caractere).
 */
const normalizeWithMap = (text: string) => {
  let normalized = ''
  const positions: number[] = []

  for (let index = 0; index < text.length; index += 1) {
    const clean = text[index]
      .normalize('NFD')
      .replace(COMBINING_MARKS, '')
      .toLowerCase()

    for (const char of clean) {
      normalized += char
      positions.push(index)
    }
  }

  return { normalized, positions }
}

interface IScriptMatch {
  start: number
  end: number
  kind: ScriptKind
}

const findMatches = (
  text: string,
  nextGenericKind: () => ScriptKind | 'literal'
): IScriptMatch[] => {
  const { normalized, positions } = normalizeWithMap(text)
  const matches: IScriptMatch[] = []
  let cursor = 0

  while (cursor < normalized.length) {
    const token = SCRIPT_TOKENS.find(({ pattern }) =>
      normalized.startsWith(pattern, cursor)
    )

    if (!token) {
      cursor += 1
      continue
    }

    const end = cursor + token.pattern.length
    const kind = token.kind === 'generic' ? nextGenericKind() : token.kind

    if (kind !== 'literal') {
      matches.push({
        start: positions[cursor],
        end: positions[end - 1] + 1,
        kind
      })
    }

    cursor = end
  }

  return matches
}

const replaceMatches = (
  text: string,
  matches: IScriptMatch[],
  values: Record<ScriptKind, string>
): string => {
  let result = ''
  let cursor = 0

  for (const match of matches) {
    const raw = values[match.kind]
    const value =
      match.kind === 'greeting' && startsSentence(text, match.start)
        ? capitalize(raw)
        : raw

    result += text.slice(cursor, match.start) + value
    cursor = match.end
  }

  return result + text.slice(cursor)
}

export interface IAboutScriptOptions {
  language: TLanguage
  birthDate?: string
  now?: Date
}

/**
 * Troca os placeholders de um parágrafo já resolvido. Prefira
 * `resolveAboutScripts` quando o texto tem mais de um parágrafo: aí o
 * genérico "o script vai aqui" é contado ao longo de todos eles.
 */
export const resolveAboutScript = (
  text: string,
  options: IAboutScriptOptions
): string => resolveAboutScripts([text], options)[0]

/**
 * Resolve os placeholders de todo o "Sobre mim".
 *
 * - "o script vai aqui" (genérico): 1ª ocorrência do texto inteiro → saudação,
 *   2ª → idade. As seguintes ficam literais, para que um placeholder sobrando
 *   apareça na tela em vez de virar texto errado.
 * - "o script da idade vai aqui" / "{{idade}}" → idade.
 * - "o script da saudacao vai aqui" / "{{saudacao}}" → saudação (bom dia,
 *   boa tarde, boa noite ou boa madrugada, conforme a hora do visitante).
 */
export const resolveAboutScripts = (
  texts: string[],
  { language, birthDate = BIRTH_DATE, now = new Date() }: IAboutScriptOptions
): string[] => {
  const values: Record<ScriptKind, string> = {
    greeting: getGreeting(language, now),
    age: String(calculateAge(birthDate, now))
  }

  let genericCount = 0

  const nextGenericKind = (): ScriptKind | 'literal' => {
    const occurrence = genericCount
    genericCount += 1

    if (occurrence === 0) return 'greeting'
    if (occurrence === 1) return 'age'
    return 'literal'
  }

  return texts.map(text =>
    replaceMatches(text, findMatches(text, nextGenericKind), values)
  )
}

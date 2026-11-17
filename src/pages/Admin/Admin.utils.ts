import {
  DATA_SECTION_KEYS,
  DataRow,
  DataSectionKey,
  validateSectionDocument
} from '@/services/portfolio-data.service'
import {
  getSkillsParityIssues,
  isSkillsParitySection
} from '@/services/skills-parity.service'
import { isRecord } from '@/utils/is-record'

export const SECTION_FORM_ID = 'section-editor-form'
export const LEVEL_MAX = 5

export const CONTENT_SECTION_KEYS: DataSectionKey[] = DATA_SECTION_KEYS.filter(
  key => key !== 'navigation' && key !== 'footer' && key !== 'footerCopyright'
)
export const STRUCTURE_SECTION_KEYS: DataSectionKey[] =
  DATA_SECTION_KEYS.filter(key => !CONTENT_SECTION_KEYS.includes(key))

export const userInitials = (email: string): string => {
  const [localPart = ''] = email.split('@')
  const parts = localPart.split(/[.\-_+]/).filter(Boolean)
  const letters = parts
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
  return (letters || email.slice(0, 2) || 'AD').toUpperCase()
}

/* ---------- Prévia estruturada do JSON ---------- */

export type EditorValidation =
  | { valid: true; row: DataRow }
  | { valid: false; message: string }

export const getEditorValidation = (
  text: string,
  key: DataSectionKey
): EditorValidation => {
  let document: unknown

  try {
    document = JSON.parse(text)
  } catch {
    return { valid: false, message: 'Enter valid JSON before saving.' }
  }

  if (!isRecord(document)) {
    return { valid: false, message: 'The JSON root must be an object.' }
  }

  const row = validateSectionDocument(key, document)
  if (!row) {
    return {
      valid: false,
      message: `A raiz do JSON deve conter apenas "${key}" e o valor precisa seguir o schema da seção.`
    }
  }

  // skills/skillsDetails: ptBR e enUS têm que ter a mesma estrutura (mesmas
  // categorias, mesma quantidade de skills). Sem isso, adicionar uma skill em um
  // idioma só deixa o outro com uma categoria a menos.
  if (isSkillsParitySection(key)) {
    const issues = getSkillsParityIssues(document[key])

    if (issues.length > 0) {
      const resumo = issues
        .slice(0, 3)
        .map(issue => `${issue.category}: ${issue.detail}`)
        .join(' ')

      return {
        valid: false,
        message: `Idiomas desalinhados (${issues.length} ${
          issues.length === 1 ? 'diferença' : 'diferenças'
        }). ${resumo}${issues.length > 3 ? ' …' : ''}`
      }
    }
  }

  return { valid: true, row }
}

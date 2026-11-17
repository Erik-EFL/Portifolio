import {
  DATA_SECTION_KEYS,
  DataRow,
  DataSectionKey,
  validateSectionDocument
} from '@/services/portfolio-data.service'
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

  // skills/skillsDetails agora são lista única (texto base + tradução
  // opcional), então divergência entre idiomas deixou de ser possível.
  return { valid: true, row }
}

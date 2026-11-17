import { getFirebaseIdToken } from '@/services/firebase-auth.service'
import {
  type CreateDataRow,
  type DataRow,
  type DataSectionKey,
  parseDataRows,
  parseDataRow
} from '@/services/portfolio-data.service'
import type { TLanguage } from '@/@types/data-tipe.entity'

export class AdminApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
  }
}

export interface AdminSessionResponse {
  email: string
  role: string
}

export interface ResumeAvailability {
  ptBR: boolean
  enUS: boolean
}

export const RESUME_AVAILABILITY_QUERY_KEY = ['resume-availability'] as const

const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_ADMIN_API_URL
  if (!apiUrl)
    throw new Error('Admin API is not configured: set VITE_ADMIN_API_URL.')
  return apiUrl.replace(/\/+$/, '')
}

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json()
    if (isRecord(body)) {
      if (typeof body.message === 'string') return body.message
      if (typeof body.error === 'string') return body.error
      // The Functions API answers { error: { code, message } }; without this
      // unwrap every failure degrades to a bare status code.
      if (isRecord(body.error)) {
        const { code, message } = body.error
        if (typeof message === 'string') {
          return typeof code === 'string' && code
            ? `${message} (${code})`
            : message
        }
        if (typeof code === 'string' && code) return code
      }
    }
  } catch {
    // Use the status-only message when the server does not return JSON.
  }

  return `Admin API request failed (${response.status}).`
}

const authorizedHeaders = async (headers?: HeadersInit): Promise<Headers> => {
  const result = new Headers(headers)
  let idToken: string

  try {
    idToken = await getFirebaseIdToken()
  } catch (error) {
    const reason = error instanceof Error ? ` ${error.message}` : ''
    throw new Error(`Unable to obtain a valid Firebase ID token.${reason}`)
  }

  if (!idToken.trim()) {
    throw new Error('Firebase ID token is missing or expired. Sign in again.')
  }

  result.set('Authorization', `Bearer ${idToken}`)
  return result
}

const ensureSuccess = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const message = await getErrorMessage(response)
    if (response.status === 401 || response.status === 403) {
      throw new AdminApiError(
        response.status,
        `Server authorization denied this action: ${message}`
      )
    }
    throw new AdminApiError(response.status, message)
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const getRows = async (): Promise<DataRow[]> => {
  const response = await fetch(`${getApiBaseUrl()}/api/rows`)
  await ensureSuccess(response)
  return parseDataRows(await response.json())
}

export const getAdminSession = async (): Promise<AdminSessionResponse> => {
  const response = await fetch(`${getApiBaseUrl()}/api/session`, {
    headers: await authorizedHeaders()
  })
  await ensureSuccess(response)
  const result: unknown = await response.json()

  if (
    !isRecord(result) ||
    typeof result.email !== 'string' ||
    typeof result.role !== 'string'
  ) {
    throw new Error('The admin session API returned an invalid response.')
  }

  return { email: result.email, role: result.role }
}

export const getRow = async (id: string): Promise<DataRow> => {
  const response = await fetch(
    `${getApiBaseUrl()}/api/rows/${encodeURIComponent(id)}`
  )
  await ensureSuccess(response)
  const result: unknown = await response.json()
  if (
    typeof result === 'object' &&
    result !== null &&
    'key' in result &&
    'value' in result
  ) {
    const idValue =
      '_id' in result && typeof result._id === 'string' ? result._id : id
    const row = parseDataRow(result.key, result.value, idValue)
    if (row) return row
  }
  throw new Error('The row API response is invalid.')
}

export const createRows = async (rows: CreateDataRow[]): Promise<DataRow[]> => {
  const response = await fetch(`${getApiBaseUrl()}/api/rows`, {
    method: 'POST',
    headers: await authorizedHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(rows)
  })
  await ensureSuccess(response)

  // The content service is eventually consistent: the created row (with `_id`)
  // comes back here, so callers can seed their cache instead of re-reading a
  // list that may still lag behind.
  const body: unknown = await response.json().catch(() => null)
  if (body === null) return []

  try {
    return parseDataRows(body)
  } catch {
    return []
  }
}

export const updateRow = async (row: {
  _id: string
  key: DataSectionKey
  value: DataRow['value']
}): Promise<void> => {
  const response = await fetch(`${getApiBaseUrl()}/api/rows`, {
    method: 'PUT',
    headers: await authorizedHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(row)
  })
  await ensureSuccess(response)
}

export const deleteRows = async (ids: string[]): Promise<void> => {
  const response = await fetch(`${getApiBaseUrl()}/api/rows`, {
    method: 'DELETE',
    headers: await authorizedHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(ids)
  })
  await ensureSuccess(response)
}

export const uploadResume = async (
  language: TLanguage,
  file: File
): Promise<void> => {
  const response = await fetch(`${getApiBaseUrl()}/api/resumes/${language}`, {
    method: 'POST',
    headers: await authorizedHeaders({ 'Content-Type': 'application/pdf' }),
    body: file
  })
  await ensureSuccess(response)
}

export const getResumeUrl = (language: TLanguage): string | undefined => {
  const apiUrl = import.meta.env.VITE_ADMIN_API_URL
  return apiUrl
    ? `${apiUrl.replace(/\/+$/, '')}/api/resumes/${language}`
    : undefined
}

export const getResumeAvailability = async (): Promise<ResumeAvailability> => {
  const response = await fetch(`${getApiBaseUrl()}/api/resumes`)
  await ensureSuccess(response)
  const result: unknown = await response.json()

  if (
    !isRecord(result) ||
    typeof result.ptBR !== 'boolean' ||
    typeof result.enUS !== 'boolean'
  ) {
    throw new Error('The resume availability API returned an invalid response.')
  }

  return { ptBR: result.ptBR, enUS: result.enUS }
}

export const downloadResume = async (language: TLanguage): Promise<void> => {
  const resumeUrl = getResumeUrl(language)
  if (!resumeUrl) {
    throw new Error(
      'Resume downloads are not configured: set VITE_ADMIN_API_URL.'
    )
  }

  const response = await fetch(resumeUrl)
  await ensureSuccess(response)
  const pdf = await response.blob()

  if (pdf.type && pdf.type !== 'application/pdf') {
    throw new Error('The resume endpoint did not return a PDF.')
  }

  const objectUrl = URL.createObjectURL(pdf)
  const downloadLink = document.createElement('a')
  downloadLink.href = objectUrl
  downloadLink.download = `resume-${language}.pdf`
  document.body.append(downloadLink)
  downloadLink.click()
  downloadLink.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export const PORTFOLIO_ROWS_QUERY_KEY = ['portfolio-content-rows'] as const

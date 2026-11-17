import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DATA_SECTION_KEYS,
  DataRow,
  DataSectionKey,
  createSectionDocument,
  mergePortfolioRows,
  validateSectionDocument
} from '@/services/portfolio-data.service'
import {
  AdminApiError,
  PORTFOLIO_ROWS_QUERY_KEY,
  createRows,
  deleteRows,
  getAdminSession,
  getResumeAvailability,
  getResumeUrl,
  getRows,
  RESUME_AVAILABILITY_QUERY_KEY,
  updateRow,
  uploadResume
} from '@/services/admin-api.service'
import {
  AdminAuthUser,
  signInWithEmailPassword,
  signInWithGoogle
} from '@/services/firebase-auth.service'
import { useAdminAuthStore } from '@/store/admin-auth.store'
import type { IData, TLanguage } from '@/@types/data-tipe.entity'
import styles from './Admin.module.css'

const SECTION_FORM_ID = 'section-editor-form'
const LEVEL_MAX = 5

const CONTENT_SECTION_KEYS: DataSectionKey[] = DATA_SECTION_KEYS.filter(
  key => key !== 'navigation' && key !== 'footer' && key !== 'footerCopyright'
)
const STRUCTURE_SECTION_KEYS: DataSectionKey[] = DATA_SECTION_KEYS.filter(
  key => !CONTENT_SECTION_KEYS.includes(key)
)

const ICONS = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
  doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  list: 'M4 6h16M4 12h16M4 18h7',
  box: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  currency:
    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  external:
    'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
  logout:
    'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  check: 'M5 13l4 4L19 7',
  cross: 'M6 18L18 6M6 6l12 12',
  upload:
    'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  grid: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  trash:
    'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  restore:
    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  file: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  plus: 'M12 4v16m8-8H4'
} as const

const SECTION_ICONS: Record<DataSectionKey, string> = {
  navigation: ICONS.list,
  footer: ICONS.box,
  footerCopyright: ICONS.currency,
  home: ICONS.home,
  about: ICONS.user,
  skills: ICONS.bolt,
  skillsDetails: ICONS.doc
}

interface IconProps {
  path: string
  size?: number
  className?: string
}

const Icon = ({ path, size = 16, className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
  >
    {path.split(' M').map((segment, index) => (
      <path key={index} d={index === 0 ? segment : `M${segment}`} />
    ))}
  </svg>
)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const displayError = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unexpected request failure.'

const userInitials = (email: string): string => {
  const [localPart = ''] = email.split('@')
  const parts = localPart.split(/[.\-_+]/).filter(Boolean)
  const letters = parts
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
  return (letters || email.slice(0, 2) || 'AD').toUpperCase()
}

/* ---------- Prévia estruturada do JSON ---------- */

const LevelPicker = ({
  value,
  label,
  disabled,
  onChange
}: {
  value: number
  label: string
  disabled: boolean
  onChange: (level: number) => void
}) => {
  const current = Math.max(0, Math.min(LEVEL_MAX, Math.round(value)))
  const full = current === LEVEL_MAX

  return (
    <span className={styles.gauge}>
      {Array.from({ length: LEVEL_MAX }, (_, index) => {
        const level = index + 1
        return (
          <button
            key={level}
            className={`${styles.bar} ${styles.barButton} ${
              level <= current ? (full ? styles.barOnFull : styles.barOn) : ''
            }`}
            type='button'
            disabled={disabled}
            title={`Nível ${level} de ${LEVEL_MAX}`}
            aria-label={`${label}: nível ${level} de ${LEVEL_MAX}`}
            aria-pressed={level <= current}
            onClick={() => onChange(level === current ? level - 1 : level)}
          />
        )
      })}
      <span
        className={`${styles.gaugeValue} ${full ? styles.gaugeValueFull : ''}`}
      >
        {current}/{LEVEL_MAX}
      </span>
    </span>
  )
}

const InlineInput = ({
  value,
  label,
  disabled,
  placeholder,
  onChange
}: {
  value: string
  label: string
  disabled: boolean
  placeholder?: string
  onChange: (value: string) => void
}) => (
  <input
    className={styles.inlineInput}
    type='text'
    value={value}
    disabled={disabled}
    aria-label={label}
    placeholder={placeholder}
    onChange={event => onChange(event.currentTarget.value)}
  />
)

const ObjectListEditor = ({
  rows,
  label,
  disabled,
  onChange
}: {
  rows: unknown[]
  label: string
  disabled: boolean
  onChange: (rows: unknown[]) => void
}) => {
  const sample = rows.find(isRecord) ?? {}
  const levelKeys = Object.keys(sample).filter(
    key => typeof sample[key] === 'number'
  )

  const patchRow = (index: number, patch: Record<string, unknown>) => {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...(isRecord(row) ? row : {}), ...patch } : row
      )
    )
  }

  const addRow = () => {
    const template: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(sample)) {
      if (typeof value === 'string') template[key] = ''
      else if (typeof value === 'number') template[key] = 1
      else if (typeof value === 'boolean') template[key] = false
    }

    if (Object.keys(template).length === 0) template.name = ''
    onChange([...rows, template])
  }

  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>{label}</span>
      {rows.map((row, index) => {
        const record = isRecord(row) ? row : {}
        const rowName =
          typeof record.name === 'string' && record.name.trim()
            ? record.name
            : `item ${index + 1}`

        return (
          <div className={styles.skillRow} key={index}>
            <InlineInput
              value={typeof record.name === 'string' ? record.name : ''}
              label={`${label} ${index + 1}`}
              disabled={disabled}
              placeholder='Nome'
              onChange={name => patchRow(index, { name })}
            />
            <span className={styles.skillMeta}>
              {levelKeys.map(key => (
                <LevelPicker
                  key={key}
                  value={
                    typeof record[key] === 'number'
                      ? (record[key] as number)
                      : 1
                  }
                  label={rowName}
                  disabled={disabled}
                  onChange={level => patchRow(index, { [key]: level })}
                />
              ))}
              <button
                className={styles.iconButton}
                type='button'
                disabled={disabled}
                title='Remover'
                aria-label={`Remover ${label} ${index + 1}`}
                onClick={() =>
                  onChange(rows.filter((_, rowIndex) => rowIndex !== index))
                }
              >
                <Icon path={ICONS.trash} size={14} />
              </button>
            </span>
          </div>
        )
      })}
      <button
        className={styles.addRowButton}
        type='button'
        disabled={disabled}
        onClick={addRow}
      >
        <Icon path={ICONS.plus} size={14} />
        Adicionar {label.toLowerCase()}
      </button>
    </div>
  )
}

const StringListEditor = ({
  lines,
  label,
  disabled,
  onChange
}: {
  lines: unknown[]
  label: string
  disabled: boolean
  onChange: (lines: unknown[]) => void
}) => (
  <div className={styles.fieldGroup}>
    <span className={styles.fieldLabel}>{label}</span>
    {lines.map((line, index) => (
      <div className={styles.inlineRow} key={index}>
        <textarea
          className={styles.inlineTextarea}
          rows={2}
          value={typeof line === 'string' ? line : JSON.stringify(line)}
          disabled={disabled}
          aria-label={`${label} ${index + 1}`}
          onChange={event =>
            onChange(
              lines.map((current, lineIndex) =>
                lineIndex === index ? event.currentTarget.value : current
              )
            )
          }
        />
        <button
          className={styles.iconButton}
          type='button'
          disabled={disabled}
          title='Remover linha'
          aria-label={`Remover ${label} ${index + 1}`}
          onClick={() =>
            onChange(lines.filter((_, lineIndex) => lineIndex !== index))
          }
        >
          <Icon path={ICONS.trash} size={14} />
        </button>
      </div>
    ))}
    <button
      className={styles.addRowButton}
      type='button'
      disabled={disabled}
      onClick={() => onChange([...lines, ''])}
    >
      <Icon path={ICONS.plus} size={14} />
      Adicionar linha em {label}
    </button>
  </div>
)

const FieldEditor = ({
  field,
  value,
  disabled,
  onChange
}: {
  field: string
  value: unknown
  disabled: boolean
  onChange: (value: unknown) => void
}) => {
  if (Array.isArray(value)) {
    if (value.some(isRecord)) {
      return (
        <ObjectListEditor
          rows={value}
          label={field}
          disabled={disabled}
          onChange={onChange}
        />
      )
    }

    return (
      <StringListEditor
        lines={value}
        label={field}
        disabled={disabled}
        onChange={onChange}
      />
    )
  }

  if (typeof value === 'number') {
    return (
      <div className={styles.fieldInline}>
        <span className={styles.fieldLabel}>{field}</span>
        <input
          className={styles.inlineNumber}
          type='number'
          value={value}
          disabled={disabled}
          aria-label={field}
          onChange={event => onChange(Number(event.currentTarget.value))}
        />
      </div>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <label className={styles.fieldInline}>
        <input
          type='checkbox'
          checked={value}
          disabled={disabled}
          onChange={event => onChange(event.currentTarget.checked)}
        />
        <span className={styles.fieldLabel}>{field}</span>
      </label>
    )
  }

  return (
    <div className={styles.fieldInline}>
      <span className={styles.fieldLabel}>{field}</span>
      <InlineInput
        value={typeof value === 'string' ? value : JSON.stringify(value)}
        label={field}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  )
}

const createItemTemplate = (key: DataSectionKey): Record<string, unknown> => {
  switch (key) {
    case 'navigation':
    case 'footer':
      return { name: '', link: '' }
    case 'footerCopyright':
      return { copyright: '' }
    case 'home':
      return { circle: '', name: '', title: '', description: [''], link: '' }
    case 'about':
      return { description: [''] }
    default:
      return {
        title: 'Nova categoria',
        skills: [{ name: 'Nova habilidade', level: 3 }]
      }
  }
}

const ItemEditor = ({
  item,
  index,
  disabled,
  onChange,
  onRemove
}: {
  item: unknown
  index: number
  disabled: boolean
  onChange: (item: Record<string, unknown>) => void
  onRemove: () => void
}) => {
  const record = isRecord(item) ? item : {}
  const hasTitle = typeof record.title === 'string'

  return (
    <div className={styles.itemCard}>
      <div className={styles.itemHead}>
        <span className={styles.categoryTitle}>
          <span className={styles.categoryDot} aria-hidden='true' />
          {hasTitle ? (
            <InlineInput
              value={record.title as string}
              label='Título do item'
              disabled={disabled}
              placeholder='Título'
              onChange={title => onChange({ ...record, title })}
            />
          ) : (
            <span className={styles.itemLabel}>Item {index + 1}</span>
          )}
        </span>
        <button
          className={styles.iconButton}
          type='button'
          disabled={disabled}
          title='Remover item'
          aria-label={`Remover item ${index + 1}`}
          onClick={onRemove}
        >
          <Icon path={ICONS.trash} size={14} />
        </button>
      </div>
      {Object.entries(record)
        .filter(([field]) => !(hasTitle && field === 'title'))
        .map(([field, fieldValue]) => (
          <FieldEditor
            key={field}
            field={field}
            value={fieldValue}
            disabled={disabled}
            onChange={next =>
              onChange({
                ...record,
                [field]: next
              })
            }
          />
        ))}
    </div>
  )
}

const VisualEditor = ({
  keyName,
  section,
  disabled,
  onChange
}: {
  keyName: DataSectionKey
  section: unknown
  disabled: boolean
  onChange: (section: unknown) => void
}) => {
  if (!Array.isArray(section)) {
    return (
      <p className={styles.previewEmpty}>
        Corrija o JSON ao lado para voltar a editar esta seção visualmente.
      </p>
    )
  }

  const updateLocale = (
    localeIndex: number,
    updater: (locale: Record<string, unknown>) => Record<string, unknown>
  ) =>
    onChange(
      section.map((locale, index) =>
        index === localeIndex ? updater(isRecord(locale) ? locale : {}) : locale
      )
    )

  const addLabel =
    keyName === 'skills' || keyName === 'skillsDetails' ? 'categoria' : 'item'
  const firstLocale = isRecord(section[0]) ? section[0] : {}
  const firstLanguage =
    typeof firstLocale.language === 'string' ? firstLocale.language : 'bloco 1'

  return (
    <div className={styles.visualEditor}>
      <div className={styles.columnHead}>
        <span className={styles.columnTitle}>Editor visual</span>
        <button
          className={styles.addHeadButton}
          type='button'
          disabled={disabled}
          title={`Adicionar ${addLabel} no bloco ${firstLanguage}`}
          onClick={() =>
            updateLocale(0, current => ({
              ...current,
              items: [
                ...(Array.isArray(current.items) ? current.items : []),
                createItemTemplate(keyName)
              ]
            }))
          }
        >
          <Icon path={ICONS.plus} size={14} />
          Adicionar {addLabel}
          {section.length > 1 ? ` · ${firstLanguage}` : ''}
        </button>
      </div>

      <div className={styles.previewStack}>
        {section.map((locale, localeIndex) => {
          const record = isRecord(locale) ? locale : {}
          const items = Array.isArray(record.items) ? record.items : []

          return (
            <div className={styles.previewLang} key={localeIndex}>
              <div className={styles.previewLangHead}>
                <span className={styles.chip}>
                  {typeof record.language === 'string'
                    ? record.language
                    : `bloco ${localeIndex + 1}`}
                </span>
                <span className={styles.categoryCount}>
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              {items.length === 0 && (
                <p className={styles.previewEmpty}>
                  Nenhum item neste idioma. Crie o primeiro com o botão abaixo.
                </p>
              )}
              {items.map((item, itemIndex) => (
                <ItemEditor
                  key={itemIndex}
                  item={item}
                  index={itemIndex}
                  disabled={disabled}
                  onChange={next =>
                    updateLocale(localeIndex, current => {
                      const nextItems = Array.isArray(current.items)
                        ? [...current.items]
                        : []
                      nextItems[itemIndex] = next
                      return { ...current, items: nextItems }
                    })
                  }
                  onRemove={() =>
                    updateLocale(localeIndex, current => ({
                      ...current,
                      items: (Array.isArray(current.items)
                        ? current.items
                        : []
                      ).filter((_, index) => index !== itemIndex)
                    }))
                  }
                />
              ))}
              <button
                className={styles.addRowButton}
                type='button'
                disabled={disabled}
                onClick={() =>
                  updateLocale(localeIndex, current => ({
                    ...current,
                    items: [
                      ...(Array.isArray(current.items) ? current.items : []),
                      createItemTemplate(keyName)
                    ]
                  }))
                }
              >
                <Icon path={ICONS.plus} size={14} />
                Adicionar {addLabel}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Login ---------- */

const SignInForm = () => {
  const setUser = useAdminAuthStore(state => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user: AdminAuthUser = await signInWithEmailPassword(email, password)
      setUser(user)
      setPassword('')
    } catch (reason) {
      setError(displayError(reason))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      const user: AdminAuthUser = await signInWithGoogle()
      setUser(user)
    } catch (reason) {
      setError(displayError(reason))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.authShell}>
      <section className={styles.authCard} aria-labelledby='admin-signin-title'>
        <div className={styles.authBrand}>
          <span className={styles.brandMark} aria-hidden='true'>
            {'</>'}
          </span>
          <div>
            <h1 className={styles.authTitle} id='admin-signin-title'>
              Acesso administrativo
            </h1>
            <p className={styles.authSub}>
              Entre com uma conta habilitada no Firebase Authentication.
            </p>
          </div>
        </div>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor='admin-email'>
              Email
            </label>
            <input
              className={styles.input}
              id='admin-email'
              name='email'
              type='email'
              autoComplete='username'
              placeholder='voce@exemplo.com'
              required
              value={email}
              onChange={event => setEmail(event.currentTarget.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor='admin-password'>
              Senha
            </label>
            <input
              className={styles.input}
              id='admin-password'
              name='password'
              type='password'
              autoComplete='current-password'
              placeholder='••••••••'
              required
              value={password}
              onChange={event => setPassword(event.currentTarget.value)}
            />
          </div>
          <div className={styles.authActions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              type='submit'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </button>
            <button
              className={`${styles.btn} ${styles.btnSubtle}`}
              type='button'
              disabled={isSubmitting}
              onClick={() => void handleGoogleSignIn()}
            >
              Continuar com Google
            </button>
          </div>
          {error && (
            <p
              className={`${styles.notice} ${styles.noticeError}`}
              role='alert'
            >
              {error}
            </p>
          )}
        </form>
        <p className={styles.authFoot}>
          Toda escrita é autorizada pelo servidor: ocultar a rota não é controle
          de acesso.
        </p>
      </section>
    </main>
  )
}

/* ---------- Editor de seção ---------- */

type EditorValidation =
  | { valid: true; row: DataRow }
  | { valid: false; message: string }

const getEditorValidation = (
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

  return { valid: true, row }
}

interface SectionEditorProps {
  keyName: DataSectionKey
  value: IData[DataSectionKey]
  remoteRow: DataRow | undefined
  canMutate: boolean
  onSave: (row: DataRow) => void
  onDelete: () => void
  isSaving: boolean
  isDeleting: boolean
  notice: string
  setNotice: (message: string) => void
}

const SectionEditor = ({
  keyName,
  value,
  remoteRow,
  canMutate,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  notice,
  setNotice
}: SectionEditorProps) => {
  const [text, setText] = useState(() => createSectionDocument(keyName, value))
  const [view, setView] = useState<'visual' | 'json'>('visual')
  const [copied, setCopied] = useState(false)
  const validation = getEditorValidation(text, keyName)
  const hasRemoteRow = remoteRow !== undefined
  // Editar é local: mexe apenas no JSON em memória. Gravar continua exigindo a
  // lista de linhas carregada (canMutate), para nunca sobrescrever às cegas.
  const canEdit = true
  const lineCount = text.split('\n').length
  const parsedDocument = ((): unknown => {
    try {
      return JSON.parse(text) as unknown
    } catch {
      return null
    }
  })()
  const sectionDocument = isRecord(parsedDocument)
    ? parsedDocument[keyName]
    : null

  const commitSection = (nextSection: unknown) => {
    const base = isRecord(parsedDocument) ? parsedDocument : {}
    setText(JSON.stringify({ ...base, [keyName]: nextSection }, null, 2))
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setNotice('Não foi possível copiar o JSON neste navegador.')
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validation.valid) {
      setNotice(validation.message)
      return
    }
    onSave(validation.row)
  }

  const handleReset = () => {
    setText(createSectionDocument(keyName, value))
    setNotice(
      `Editor restaurado para ${
        hasRemoteRow ? 'a seção salva' : 'o fallback estático'
      }.`
    )
  }

  return (
    <section className={styles.card} aria-labelledby='section-editor-title'>
      <div className={styles.editorHead}>
        <div>
          <div className={styles.editorKeyRow}>
            <h3 className={styles.editorKey} id='section-editor-title'>
              {keyName}
            </h3>
            <span className={styles.editorLangTag}>schema</span>
          </div>
          <p className={styles.editorSub}>
            {hasRemoteRow
              ? 'Esta seção possui linha no servidor. Salvar atualiza; excluir volta ao fallback estático.'
              : 'Nenhuma linha no servidor. Salvar adiciona esta seção ao banco de produção.'}
          </p>
        </div>
        <div className={styles.viewSwitch}>
          <span className={styles.viewSwitchLabel}>Modo de edição:</span>
          <div
            className={styles.viewSwitchGroup}
            role='tablist'
            aria-label='Modo de edição'
          >
            <button
              className={`${styles.viewButton} ${
                view === 'visual' ? styles.viewButtonActive : ''
              }`}
              type='button'
              role='tab'
              aria-selected={view === 'visual'}
              onClick={() => setView('visual')}
            >
              <Icon path={ICONS.grid} size={14} />
              Visual Interativo
            </button>
            <button
              className={`${styles.viewButton} ${
                view === 'json' ? styles.viewButtonActive : ''
              }`}
              type='button'
              role='tab'
              aria-selected={view === 'json'}
              onClick={() => setView('json')}
            >
              <Icon path={ICONS.code} size={14} />
              JSON bruto
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${styles.editorBody} ${
          view === 'json' ? styles.editorBodyJson : ''
        }`}
      >
        <div className={`${styles.editorCol} ${styles.previewCol}`}>
          <VisualEditor
            keyName={keyName}
            section={sectionDocument}
            disabled={!canEdit}
            onChange={commitSection}
          />
        </div>

        <div className={styles.editorCol}>
          <div className={styles.columnHead}>
            <span className={styles.columnTitle}>Schema JSON direto</span>
            <span className={styles.columnHeadActions}>
              <span className={styles.rootTag}>Root: {keyName}</span>
              <button
                className={styles.iconButton}
                type='button'
                onClick={() => void handleCopy()}
                title='Copiar JSON'
                aria-label='Copiar JSON'
              >
                <Icon path={copied ? ICONS.check : ICONS.copy} size={16} />
              </button>
            </span>
          </div>
          <form
            className={styles.codePane}
            id={SECTION_FORM_ID}
            onSubmit={handleSubmit}
          >
            <div className={styles.codeStatusBar}>
              <div className={styles.codeStatusGroup}>
                <span
                  className={`${styles.codeDot} ${
                    validation.valid ? '' : styles.codeDotError
                  }`}
                  aria-hidden='true'
                />
                <span
                  className={`${styles.codeStatusText} ${
                    validation.valid ? '' : styles.codeStatusTextError
                  }`}
                >
                  {validation.valid
                    ? 'Valid section JSON.'
                    : validation.message}
                </span>
              </div>
              <span>JSON (UTF-8)</span>
            </div>
            <textarea
              className={styles.codeEditor}
              id='section-json'
              name='section-json'
              rows={24}
              spellCheck={false}
              aria-label={`Section JSON for ${keyName}`}
              value={text}
              disabled={!canEdit}
              aria-invalid={!validation.valid}
              aria-describedby='section-json-validation'
              onChange={event => setText(event.currentTarget.value)}
            />
            <div className={styles.codeFooter} id='section-json-validation'>
              <span>
                {lineCount} linhas · {text.length} caracteres
              </span>
              <span
                className={
                  validation.valid
                    ? styles.codeFooterOk
                    : styles.codeFooterError
                }
              >
                <Icon
                  path={validation.valid ? ICONS.check : ICONS.cross}
                  size={14}
                />
                {validation.valid ? 'Sintaxe OK' : 'JSON inválido'}
              </span>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionBarLeft}>
          <button
            className={`${styles.btn} ${styles.btnEmerald}`}
            type='submit'
            form={SECTION_FORM_ID}
            disabled={!canMutate || !validation.valid || isSaving || isDeleting}
            title={
              canMutate
                ? undefined
                : 'Indisponível enquanto a lista de linhas do servidor não carregar.'
            }
          >
            <Icon path={ICONS.check} size={14} />
            {isSaving
              ? 'Salvando…'
              : hasRemoteRow
              ? 'Atualizar Seção'
              : 'Adicionar Seção'}
          </button>
          <button
            className={`${styles.btn} ${styles.btnSubtle}`}
            type='button'
            onClick={handleReset}
            disabled={isSaving || isDeleting}
          >
            <Icon path={ICONS.restore} size={14} />
            Restaurar editor
          </button>
          {notice && (
            <span className={styles.notice} role='status' aria-live='polite'>
              {notice}
            </span>
          )}
        </div>
        <div className={styles.actionBarRight}>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            type='button'
            onClick={onDelete}
            disabled={!canMutate || !hasRemoteRow || isSaving || isDeleting}
          >
            <Icon path={ICONS.trash} size={14} />
            {isDeleting ? 'Excluindo…' : 'Excluir Seção do Servidor'}
          </button>
        </div>
      </div>
    </section>
  )
}

/* ---------- Resumes ---------- */

interface ResumeUploaderProps {
  language: TLanguage
  label: string
  available: boolean | undefined
}

const ResumeUploader = ({
  language,
  label,
  available
}: ResumeUploaderProps) => {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [notice, setNotice] = useState('')
  const mutation = useMutation({
    mutationFn: (selectedFile: File) => uploadResume(language, selectedFile),
    onSuccess: async () => {
      setNotice(`${label} enviado com sucesso.`)
      setFile(null)
      await queryClient.invalidateQueries({
        queryKey: RESUME_AVAILABILITY_QUERY_KEY
      })
    },
    onError: (error: Error) => setNotice(error.message)
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      setNotice('Escolha um PDF antes de enviar.')
      return
    }
    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setNotice('Somente arquivos PDF podem ser enviados.')
      return
    }
    setNotice('')
    mutation.mutate(file)
  }

  const stateLabel =
    available === undefined
      ? 'verificando'
      : available
      ? 'enviado'
      : 'não enviado'
  const resumeUrl = available ? getResumeUrl(language) : undefined

  return (
    <article className={styles.resumeCard}>
      <div className={styles.resumeHead}>
        <div className={styles.resumeIdentity}>
          <span
            className={`${styles.resumeLang} ${
              language === 'ptBR' ? styles.resumeLangPT : styles.resumeLangEN
            }`}
            aria-hidden='true'
          >
            {language === 'ptBR' ? 'PT' : 'EN'}
          </span>
          <div>
            <h4 className={styles.resumeName}>{label} PDF</h4>
            <p className={styles.resumeFile}>
              {file ? file.name : `curriculo_${language}.pdf`}
            </p>
          </div>
        </div>
        <span
          className={`${styles.resumeState} ${
            available ? styles.resumeStateOn : styles.resumeStateOff
          }`}
        >
          {stateLabel}
        </span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.dropzone}>
          <input
            className={styles.dropzoneInput}
            key={`${language}:${file ? 'selected' : 'empty'}`}
            id={`resume-${language}`}
            name={`resume-${language}`}
            type='file'
            accept='application/pdf,.pdf'
            onChange={event => {
              setFile(event.currentTarget.files?.item(0) ?? null)
              setNotice('')
            }}
          />
          <label
            className={styles.dropzoneLabel}
            htmlFor={`resume-${language}`}
          >
            <Icon
              path={ICONS.upload}
              size={20}
              className={styles.dropzoneIcon}
            />
            <span className={styles.dropzoneText}>
              Escolher arquivo ou arrastar PDF
            </span>
            <span className={styles.dropzoneHint}>PDF de até 10 MB</span>
          </label>
        </div>
        <div className={styles.resumeActions}>
          {resumeUrl ? (
            <a
              className={`${styles.btn} ${styles.btnGhost}`}
              href={resumeUrl}
              target='_blank'
              rel='noreferrer'
            >
              <Icon path={ICONS.eye} size={14} />
              Visualizar PDF
            </a>
          ) : (
            <span className={styles.resumeHint}>
              {notice || 'Nenhum PDF publicado para este idioma.'}
            </span>
          )}
          <button
            className={`${styles.btn} ${styles.btnSubtle}`}
            type='submit'
            disabled={!file || mutation.isPending}
          >
            {mutation.isPending ? 'Enviando…' : `Upload ${language}`}
          </button>
        </div>
        {notice && resumeUrl && (
          <p className={styles.resumeHint} role='status' aria-live='polite'>
            {notice}
          </p>
        )}
      </form>
    </article>
  )
}

/* ---------- Console ---------- */

const NavGroup = ({
  title,
  keys,
  savedKeys,
  activeKey,
  onSelect
}: {
  title: string
  keys: readonly DataSectionKey[]
  savedKeys: ReadonlySet<DataSectionKey>
  activeKey: DataSectionKey
  onSelect: (key: DataSectionKey) => void
}) => (
  <div className={styles.navGroup}>
    <p className={styles.navGroupTitle}>{title}</p>
    <ul className={styles.navList}>
      {keys.map(key => {
        const isSaved = savedKeys.has(key)
        return (
          <li key={key}>
            <button
              className={`${styles.navItem} ${
                activeKey === key ? styles.navItemActive : ''
              }`}
              type='button'
              aria-pressed={activeKey === key}
              onClick={() => onSelect(key)}
            >
              <span className={styles.navItemLabel}>
                <Icon
                  className={styles.navIcon}
                  path={SECTION_ICONS[key]}
                  size={16}
                />
                {key}
              </span>
              <span
                className={`${styles.navBadge} ${
                  isSaved ? styles.navBadgeSaved : ''
                }`}
              >
                {isSaved ? 'ativo' : 'fallback'}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  </div>
)

const AdminConsole = () => {
  const queryClient = useQueryClient()
  const user = useAdminAuthStore(state => state.user)
  const signOut = useAdminAuthStore(state => state.signOut)
  const [activeKey, setActiveKey] = useState<DataSectionKey>('navigation')
  const [notice, setNotice] = useState('')
  const [editorRevision, setEditorRevision] = useState(0)
  const rowsQuery = useQuery({
    queryKey: PORTFOLIO_ROWS_QUERY_KEY,
    queryFn: getRows,
    retry: 1
  })
  const availabilityQuery = useQuery({
    queryKey: RESUME_AVAILABILITY_QUERY_KEY,
    queryFn: getResumeAvailability,
    retry: 0
  })
  const rows = rowsQuery.data ?? []
  const mergedData = mergePortfolioRows(rows)
  const savedKeys = new Set(rows.map(row => row.key))
  const activeRow = rows.filter(row => row.key === activeKey).at(-1)
  const activeValue = activeRow?.value ?? mergedData[activeKey]

  const saveMutation = useMutation({
    mutationFn: async (section: DataRow): Promise<DataRow> => {
      const existing = rows.filter(row => row.key === section.key).at(-1)
      if (existing) {
        if (!existing._id) {
          throw new Error(
            'A linha salva não tem ID no servidor, então não pode ser atualizada.'
          )
        }
        await updateRow({
          _id: existing._id,
          key: section.key,
          value: section.value
        })
        return { ...section, _id: existing._id } as DataRow
      }

      const [created] = await createRows([
        { key: section.key, value: section.value }
      ])
      return created ?? section
    },
    onSuccess: (saved, section) => {
      // Seed the cache with the row the service just confirmed; a plain refetch
      // can still miss it, and saving again would then create a duplicate.
      queryClient.setQueryData<DataRow[]>(PORTFOLIO_ROWS_QUERY_KEY, current => [
        ...(current ?? []).filter(row => row.key !== section.key),
        saved
      ])
      void queryClient.invalidateQueries({
        queryKey: PORTFOLIO_ROWS_QUERY_KEY,
        refetchType: 'none'
      })
      setEditorRevision(revision => revision + 1)
      setNotice('Seção salva. O servidor autorizou a escrita.')
    },
    onError: (error: Error) => setNotice(error.message)
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteRows(ids),
    onSuccess: (_data, ids) => {
      queryClient.setQueryData<DataRow[]>(PORTFOLIO_ROWS_QUERY_KEY, current =>
        (current ?? []).filter(row => !row._id || !ids.includes(row._id))
      )
      void queryClient.invalidateQueries({
        queryKey: PORTFOLIO_ROWS_QUERY_KEY,
        refetchType: 'none'
      })
      setEditorRevision(revision => revision + 1)
      setNotice(
        'Seção removida do servidor. O fallback estático voltou a valer.'
      )
    },
    onError: (error: Error) => setNotice(error.message)
  })

  const handleDelete = () => {
    const matchingRows = rows.filter(row => row.key === activeKey)
    const ids = matchingRows.flatMap(row => (row._id ? [row._id] : []))

    if (ids.length !== matchingRows.length || ids.length === 0) {
      setNotice('Não é possível excluir: a linha do servidor está sem ID.')
      return
    }

    if (!window.confirm(`Excluir a seção "${activeKey}" do servidor?`)) return

    setNotice('')
    deleteMutation.mutate(ids)
  }

  const canMutate = rowsQuery.isSuccess
  const apiState = rowsQuery.isPending
    ? 'busy'
    : rowsQuery.error
    ? 'error'
    : 'online'
  const apiLabel = rowsQuery.isPending
    ? 'Conectando'
    : rowsQuery.error
    ? 'API indisponível'
    : 'Servidor online'
  const email = user?.email ?? ''

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIdentity}>
            <span className={styles.brandMark} aria-hidden='true'>
              {'</>'}
            </span>
            <div>
              <h1 className={styles.brandTitle}>DevPortfolio CMS</h1>
              <div className={styles.brandStatus}>
                <span className={styles.statusDot} data-state={apiState} />
                <span className={styles.statusText} data-state={apiState}>
                  {apiLabel}
                </span>
              </div>
            </div>
          </div>
          <a
            className={styles.iconButton}
            href='/'
            title='Abrir o site'
            aria-label='Abrir o site'
          >
            <Icon path={ICONS.external} size={16} />
          </a>
        </div>

        <nav className={styles.nav} aria-label='Seções de conteúdo'>
          <NavGroup
            title='Conteúdo do Portfólio'
            keys={CONTENT_SECTION_KEYS}
            savedKeys={savedKeys}
            activeKey={activeKey}
            onSelect={key => {
              setActiveKey(key)
              setNotice('')
            }}
          />
          <NavGroup
            title='Estrutura & Metadados'
            keys={STRUCTURE_SECTION_KEYS}
            savedKeys={savedKeys}
            activeKey={activeKey}
            onSelect={key => {
              setActiveKey(key)
              setNotice('')
            }}
          />
        </nav>

        <div className={styles.userCard}>
          <div className={styles.userIdentity}>
            <span className={styles.avatar} aria-hidden='true'>
              {userInitials(email)}
            </span>
            <div className={styles.userMeta}>
              <p className={styles.userName}>Administrador</p>
              <p className={styles.userEmail} title={email}>
                {email}
              </p>
            </div>
            <button
              className={styles.iconButton}
              type='button'
              onClick={signOut}
              title='Sair'
              aria-label='Sair'
            >
              <Icon path={ICONS.logout} size={16} />
            </button>
          </div>
        </div>
      </aside>

      <section className={styles.workArea}>
        <header className={styles.topbar}>
          <div className={styles.topbarMain}>
            <span className={styles.breadcrumb} aria-hidden='true'>
              database<span className={styles.breadcrumbSep}>/</span>sections
              <span className={styles.breadcrumbSep}>/</span>
            </span>
            <h2 className={styles.topbarTitle}>
              {activeKey}
              <span
                className={`${styles.badge} ${
                  activeRow ? styles.badgeSaved : styles.badgeFallback
                }`}
              >
                {activeRow ? 'linha no servidor' : 'fallback ativo (sem linha)'}
              </span>
            </h2>
          </div>
          <div className={styles.topbarActions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              type='submit'
              form={SECTION_FORM_ID}
              disabled={
                !canMutate || saveMutation.isPending || deleteMutation.isPending
              }
              title={
                canMutate
                  ? undefined
                  : 'Indisponível enquanto a lista de linhas do servidor não carregar.'
              }
            >
              <Icon path={ICONS.check} size={16} />
              {saveMutation.isPending
                ? 'Salvando…'
                : 'Salvar Seção no Servidor'}
            </button>
          </div>
        </header>

        <div className={styles.content}>
          {rowsQuery.isPending && (
            <p className={styles.notice} role='status' aria-live='polite'>
              Carregando conteúdo do servidor. A edição fica bloqueada até a
              lista de linhas carregar.
            </p>
          )}
          {rowsQuery.error && (
            <div
              className={`${styles.notice} ${styles.noticeError}`}
              role='alert'
            >
              Não foi possível carregar o conteúdo do servidor; o fallback está
              sendo exibido e as escritas estão desabilitadas.{' '}
              {displayError(rowsQuery.error)}{' '}
              <button
                className={`${styles.btn} ${styles.btnGhost}`}
                type='button'
                onClick={() => void rowsQuery.refetch()}
              >
                Tentar de novo
              </button>
            </div>
          )}

          <section className={styles.card} aria-labelledby='resumes-title'>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle} id='resumes-title'>
                  <Icon
                    className={styles.cardTitleIcon}
                    path={ICONS.file}
                    size={20}
                  />
                  About Me — Currículos &amp; documentos
                </h3>
                <p className={styles.cardSub}>
                  O upload substitui o PDF armazenado para o idioma
                  correspondente. Cada gravação é autorizada pelo servidor.
                </p>
              </div>
              <span className={styles.pill}>
                <span
                  className={`${styles.pillDot} ${
                    availabilityQuery.isSuccess
                      ? ''
                      : availabilityQuery.error
                      ? styles.pillDotMuted
                      : styles.pillDotWarn
                  }`}
                  aria-hidden='true'
                />
                {availabilityQuery.isSuccess
                  ? 'Storage conectado'
                  : availabilityQuery.error
                  ? 'Storage indisponível'
                  : 'Verificando storage'}
              </span>
            </div>
            <div className={styles.resumeGrid}>
              <ResumeUploader
                language='ptBR'
                label='Português (ptBR)'
                available={availabilityQuery.data?.ptBR}
              />
              <ResumeUploader
                language='enUS'
                label='English (enUS)'
                available={availabilityQuery.data?.enUS}
              />
            </div>
          </section>

          <SectionEditor
            key={`${activeKey}:${
              rowsQuery.isSuccess ? 'loaded' : 'not-loaded'
            }:${editorRevision}`}
            keyName={activeKey}
            value={activeValue}
            remoteRow={activeRow}
            canMutate={canMutate}
            onSave={section => {
              setNotice('')
              saveMutation.mutate(section)
            }}
            onDelete={handleDelete}
            isSaving={saveMutation.isPending}
            isDeleting={deleteMutation.isPending}
            notice={notice}
            setNotice={setNotice}
          />
        </div>
      </section>
    </main>
  )
}

/* ---------- Gate de autorização ---------- */

const AccessState = ({
  title,
  message,
  children
}: {
  title: string
  message: string
  children?: ReactNode
}) => (
  <main className={styles.authShell}>
    <section className={styles.authCard} role='status' aria-live='polite'>
      <div className={styles.authBrand}>
        <span className={styles.brandMark} aria-hidden='true'>
          {'</>'}
        </span>
        <div>
          <h1 className={styles.authTitle}>{title}</h1>
          <p className={styles.authSub}>{message}</p>
        </div>
      </div>
      <div className={styles.authActions}>{children}</div>
    </section>
  </main>
)

const AdminAccessGate = ({ user }: { user: AdminAuthUser }) => {
  const signOut = useAdminAuthStore(state => state.signOut)
  const sessionQuery = useQuery({
    queryKey: ['admin-session', user.uid],
    queryFn: getAdminSession,
    retry: false
  })

  if (sessionQuery.isPending) {
    return (
      <AccessState
        title='Verificando acesso'
        message='Validando esta conta Firebase junto ao servidor. O editor permanece oculto até a autorização.'
      >
        <button
          className={`${styles.btn} ${styles.btnSubtle}`}
          type='button'
          onClick={signOut}
        >
          Sair
        </button>
      </AccessState>
    )
  }

  if (sessionQuery.error) {
    const error = sessionQuery.error
    const denied =
      error instanceof AdminApiError &&
      (error.status === 401 || error.status === 403)

    return (
      <AccessState
        title={denied ? 'Acesso negado' : 'Acesso indisponível'}
        message={
          denied
            ? `O servidor negou o acesso administrativo (HTTP ${error.status}). O editor está oculto.`
            : 'Não foi possível verificar a autorização no servidor. O editor está oculto.'
        }
      >
        {!denied && (
          <p className={`${styles.notice} ${styles.noticeError}`} role='alert'>
            {displayError(error)}
          </p>
        )}
        {!denied && (
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type='button'
            onClick={() => void sessionQuery.refetch()}
          >
            Tentar de novo
          </button>
        )}
        <button
          className={`${styles.btn} ${styles.btnSubtle}`}
          type='button'
          onClick={signOut}
        >
          Sair
        </button>
      </AccessState>
    )
  }

  const serverSession = sessionQuery.data
  const emailMatches =
    serverSession?.email.trim().toLowerCase() ===
    user.email.trim().toLowerCase()

  if (!serverSession || serverSession.role !== 'admin' || !emailMatches) {
    return (
      <AccessState
        title='Acesso negado'
        message='O servidor não autorizou esta conta Firebase como administradora. O editor está oculto.'
      >
        <p className={`${styles.notice} ${styles.noticeError}`} role='alert'>
          {serverSession
            ? `Sessão do servidor: ${serverSession.email} (${serverSession.role}).`
            : 'Resposta de sessão inválida do servidor.'}
        </p>
        <button
          className={`${styles.btn} ${styles.btnSubtle}`}
          type='button'
          onClick={signOut}
        >
          Sair
        </button>
      </AccessState>
    )
  }

  return <AdminConsole />
}

const AdminPage = () => {
  const user = useAdminAuthStore(state => state.user)

  return user ? <AdminAccessGate user={user} /> : <SignInForm />
}

export default AdminPage

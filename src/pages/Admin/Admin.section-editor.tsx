import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  DataRow,
  DataSectionKey,
  createSectionDocument
} from '@/services/portfolio-data.service'
import { isRecord } from '@/utils/is-record'
import type { IData } from '@/@types/data-tipe.entity'
import styles from './Admin.module.css'
import { SECTION_FORM_ID, getEditorValidation } from './Admin.utils'
import { ICONS, Icon } from './Admin.icons'
import { VisualEditor } from './Admin.editors'

export interface SectionEditorProps {
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

export const SectionEditor = ({
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

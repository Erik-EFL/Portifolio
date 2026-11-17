import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getResumeUrl,
  RESUME_AVAILABILITY_QUERY_KEY,
  uploadResume
} from '@/services/admin-api.service'
import type { TLanguage } from '@/@types/portfolio.entity'
import styles from './Admin.module.css'
import { ICONS, Icon } from './Admin.icons'

export interface ResumeUploaderProps {
  language: TLanguage
  label: string
  available: boolean | undefined
}

export const ResumeUploader = ({
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

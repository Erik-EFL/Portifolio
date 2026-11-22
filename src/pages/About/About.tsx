import { AboutSkeleton } from '@/components/Skeleton'
import { useLanguage } from '@/store/language.store'
import { useQuery } from '@tanstack/react-query'
import {
  downloadResume,
  getResumeAvailability,
  getResumeUrl,
  RESUME_AVAILABILITY_QUERY_KEY
} from '@/services/admin-api.service'
import { useState } from 'react'
import { usePageMeta, type LocalizedPageMeta } from '@/seo'
import type { TLanguage } from '@/@types/portfolio.entity'
import Text from './components/Text/Text'
import {
  Main,
  PageMessage,
  ResumeButton,
  ResumeNav,
  TextColumn,
  Title
} from './about.styles'

const META: LocalizedPageMeta = {
  ptBR: {
    title: 'Sobre mim | Erik Ferreira Lima',
    description:
      'Quem é Erik Ferreira Lima: trajetória como desenvolvedor full stack JavaScript, formação e currículo para download.'
  },
  enUS: {
    title: 'About me | Erik Ferreira Lima',
    description:
      'Who Erik Ferreira Lima is: background as a full stack JavaScript developer, education and resume download.'
  }
}

const text = {
  ptBR: 'Quem sou eu',
  enUS: 'Who am I'
}

const resumeLabels = {
  ptBR: {
    label_1: 'Baixar curriculo em Português',
    label_2: 'Baixar curriculo em Inglês'
  },
  enUS: {
    label_1: 'Download Portuguese resume',
    label_2: 'Download English resume'
  }
}

const resumeLanguage = (language: TLanguage) =>
  language === 'ptBR' ? resumeLabels.ptBR : resumeLabels.enUS

const About = () => {
  const { language, data, isLoading } = useLanguage()

  console.log(data)

  usePageMeta(META, '/about')
  const portugueseResume = getResumeUrl('ptBR')
  const englishResume = getResumeUrl('enUS')
  const availabilityQuery = useQuery({
    queryKey: RESUME_AVAILABILITY_QUERY_KEY,
    queryFn: getResumeAvailability,
    retry: 1
  })
  const resumeAvailability = availabilityQuery.data
  const [downloading, setDownloading] = useState<TLanguage | null>(null)
  const [downloadError, setDownloadError] = useState('')

  const handleDownload = async (resumeLanguage: TLanguage) => {
    setDownloading(resumeLanguage)
    setDownloadError('')

    try {
      await downloadResume(resumeLanguage)
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : 'Resume download failed.'
      )
    } finally {
      setDownloading(null)
    }
  }

  return (
    <>
      <Title>{text[language]}</Title>
      <Main>
        {isLoading ? (
          <AboutSkeleton />
        ) : (
          <TextColumn>
            <Text />
          </TextColumn>
        )}
        <ResumeNav
          aria-label={
            language === 'ptBR'
              ? 'Currículos para download'
              : 'Resume downloads'
          }
        >
          {resumeAvailability?.ptBR && (
            <ResumeButton
              type='button'
              onClick={() => void handleDownload('ptBR')}
              disabled={!portugueseResume || downloading !== null}
              aria-busy={downloading === 'ptBR'}
            >
              {downloading === 'ptBR'
                ? 'Downloading…'
                : resumeLanguage(language).label_1}
            </ResumeButton>
          )}
          {resumeAvailability?.enUS && (
            <ResumeButton
              type='button'
              onClick={() => void handleDownload('enUS')}
              disabled={!englishResume || downloading !== null}
              aria-busy={downloading === 'enUS'}
            >
              {downloading === 'enUS'
                ? 'Downloading…'
                : resumeLanguage(language).label_2}
            </ResumeButton>
          )}
        </ResumeNav>
        {availabilityQuery.isFetching && (
          <PageMessage role='status' aria-live='polite'>
            {language === 'ptBR'
              ? 'Verificando currículos disponíveis…'
              : 'Checking available resumes…'}
          </PageMessage>
        )}
        {availabilityQuery.error && (
          <PageMessage role='alert'>
            {language === 'ptBR'
              ? 'Não foi possível verificar os currículos disponíveis.'
              : 'Could not check resume availability.'}{' '}
            {availabilityQuery.error instanceof Error
              ? availabilityQuery.error.message
              : 'Unknown request error.'}
            <ResumeButton
              type='button'
              onClick={() => void availabilityQuery.refetch()}
            >
              {language === 'ptBR' ? 'Tentar novamente' : 'Retry'}
            </ResumeButton>
          </PageMessage>
        )}
        {resumeAvailability && !resumeAvailability.ptBR && (
          <PageMessage role='status'>
            {language === 'ptBR'
              ? 'Currículo em português indisponível.'
              : 'Portuguese resume unavailable.'}
          </PageMessage>
        )}
        {resumeAvailability && !resumeAvailability.enUS && (
          <PageMessage role='status'>
            {language === 'ptBR'
              ? 'Currículo em inglês indisponível.'
              : 'English resume unavailable.'}
          </PageMessage>
        )}
        {downloadError && (
          <PageMessage role='alert'>{downloadError}</PageMessage>
        )}
        {!portugueseResume && !availabilityQuery.error && (
          <PageMessage role='status'>
            {language === 'ptBR'
              ? 'Downloads de currículo indisponíveis: configure VITE_ADMIN_API_URL.'
              : 'Resume downloads unavailable: configure VITE_ADMIN_API_URL.'}
          </PageMessage>
        )}
      </Main>
    </>
  )
}

export default About

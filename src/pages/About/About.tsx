import { AboutSkeleton } from '@/components/Skeleton'
import { useLanguage } from '@/store/language.store'
import { Button, Container, Grid, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import {
  downloadResume,
  getResumeAvailability,
  getResumeUrl,
  RESUME_AVAILABILITY_QUERY_KEY
} from '@/services/admin-api.service'
import { useState } from 'react'
import type { TLanguage } from '@/@types/portfolio.entity'
import Text from './components/Text/Text'
import Video from './components/Video/Video'

const text = {
  ptBR: 'Quem sou eu',
  enUS: 'Who am I'
}

const resumeLabels = {
  ptBR: 'Baixar currículo em português',
  enUS: 'Download English resume'
}

const About = () => {
  const { language, isLoading } = useLanguage()
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
      <Typography component='h1' align='center'>
        {text[language]}
      </Typography>
      <Container
        component='main'
        maxWidth='lg'
        sx={{
          margin: 'auto'
        }}
      >
        {isLoading ? (
          <AboutSkeleton />
        ) : (
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={12}
              md={8}
              lg={6}
              sx={{
                margin: 'auto'
              }}
            >
              <Video />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={8}
              lg={6}
              sx={{
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              <Text />
            </Grid>
          </Grid>
        )}
        <Stack
          component='nav'
          aria-label={
            language === 'ptBR'
              ? 'Currículos para download'
              : 'Resume downloads'
          }
          direction='row'
          useFlexGap
          flexWrap='wrap'
          spacing={2}
          justifyContent='center'
          sx={{ marginBlock: 3 }}
        >
          {resumeAvailability?.ptBR && (
            <Button
              type='button'
              onClick={() => void handleDownload('ptBR')}
              disabled={!portugueseResume || downloading !== null}
              aria-busy={downloading === 'ptBR'}
            >
              {downloading === 'ptBR' ? 'Downloading…' : resumeLabels.ptBR}
            </Button>
          )}
          {resumeAvailability?.enUS && (
            <Button
              type='button'
              onClick={() => void handleDownload('enUS')}
              disabled={!englishResume || downloading !== null}
              aria-busy={downloading === 'enUS'}
            >
              {downloading === 'enUS' ? 'Downloading…' : resumeLabels.enUS}
            </Button>
          )}
        </Stack>
        {availabilityQuery.isFetching && (
          <Typography role='status' aria-live='polite' align='center'>
            {language === 'ptBR'
              ? 'Verificando currículos disponíveis…'
              : 'Checking available resumes…'}
          </Typography>
        )}
        {availabilityQuery.error && (
          <Typography role='alert' align='center'>
            {language === 'ptBR'
              ? 'Não foi possível verificar os currículos disponíveis.'
              : 'Could not check resume availability.'}{' '}
            {availabilityQuery.error instanceof Error
              ? availabilityQuery.error.message
              : 'Unknown request error.'}
            <Button
              type='button'
              onClick={() => void availabilityQuery.refetch()}
            >
              {language === 'ptBR' ? 'Tentar novamente' : 'Retry'}
            </Button>
          </Typography>
        )}
        {resumeAvailability && !resumeAvailability.ptBR && (
          <Typography role='status' align='center'>
            {language === 'ptBR'
              ? 'Currículo em português indisponível.'
              : 'Portuguese resume unavailable.'}
          </Typography>
        )}
        {resumeAvailability && !resumeAvailability.enUS && (
          <Typography role='status' align='center'>
            {language === 'ptBR'
              ? 'Currículo em inglês indisponível.'
              : 'English resume unavailable.'}
          </Typography>
        )}
        {downloadError && (
          <Typography role='alert' align='center'>
            {downloadError}
          </Typography>
        )}
        {!portugueseResume && !availabilityQuery.error && (
          <Typography role='status' align='center'>
            {language === 'ptBR'
              ? 'Downloads de currículo indisponíveis: configure VITE_ADMIN_API_URL.'
              : 'Resume downloads unavailable: configure VITE_ADMIN_API_URL.'}
          </Typography>
        )}
      </Container>
    </>
  )
}

export default About

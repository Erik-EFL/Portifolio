import { Box, Container } from '@mui/material'
import {
  SkeletonBox,
  SkeletonDot,
  SkeletonLines,
  SkeletonRow,
  SkeletonStatusRegion,
  SkeletonText
} from './Skeleton'
import { SkeletonCardShell } from './Skeleton.styled'

const homeContentWidth = { width: '100%', maxWidth: '620px', flex: '1 1 auto' }

export const HomeContentSkeleton = () => (
  <SkeletonStatusRegion label='Carregando apresentação…'>
    <Box sx={homeContentWidth}>
      <SkeletonRow style={{ justifyContent: 'flex-start', gap: '10px' }}>
        <SkeletonDot size={16} />
        <SkeletonBox width={168} height={16} />
      </SkeletonRow>

      <Box sx={{ marginBlock: '18px 10px' }}>
        <SkeletonBox width='78%' height={38} radius={10} />
      </Box>

      <SkeletonText lines={3} widths={['100%', '92%', '58%']} lineHeight={14} />

      <Box sx={{ marginTop: '18px' }}>
        <SkeletonBox width={172} height={16} />
      </Box>
    </Box>
  </SkeletonStatusRegion>
)

export const HomeImageSkeleton = () => (
  <SkeletonStatusRegion label='Carregando foto…'>
    <Box sx={{ flexShrink: 0, width: '500px', maxWidth: '100%' }}>
      <SkeletonDot size='500px' />
    </Box>
  </SkeletonStatusRegion>
)

export const AboutSkeleton = () => (
  <SkeletonStatusRegion label='Carregando sobre mim…'>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 3,
        alignItems: 'start'
      }}
    >
      <Box sx={{ aspectRatio: '16 / 9', width: '100%' }}>
        <SkeletonBox width='100%' height='100%' radius={12} />
      </Box>
      <SkeletonLines style={{ gap: '22px' }}>
        <SkeletonText lines={3} widths={['100%', '96%', '72%']} />
        <SkeletonText lines={2} widths={['98%', '64%']} />
        <SkeletonText lines={2} widths={['94%', '48%']} />
      </SkeletonLines>
    </Box>
  </SkeletonStatusRegion>
)

export const SkillsSkeleton = () => (
  <SkeletonStatusRegion label='Carregando habilidades…'>
    <Container
      component='div'
      sx={{ maxWidth: '900px', marginTop: '60px' }}
      disableGutters
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '30px'
        }}
      >
        {Array.from({ length: 3 }, (_, cardIndex) => (
          <SkeletonCardShell key={cardIndex} $width='280px'>
            <SkeletonRow style={{ marginBottom: '16px' }}>
              <SkeletonBox width={110} height={18} />
              <SkeletonBox width={62} height={12} />
            </SkeletonRow>

            <SkeletonLines style={{ gap: '14px' }}>
              {Array.from({ length: 4 }, (_, rowIndex) => (
                <SkeletonRow key={rowIndex}>
                  <SkeletonBox
                    width={rowIndex % 2 === 0 ? 96 : 78}
                    height={14}
                  />
                  <SkeletonBox width={72} height={12} />
                </SkeletonRow>
              ))}
            </SkeletonLines>
          </SkeletonCardShell>
        ))}
      </Box>
    </Container>
  </SkeletonStatusRegion>
)

export const ProjectsSkeleton = () => (
  <SkeletonStatusRegion label='Carregando projetos…'>
    <Box
      component='main'
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem',
        maxWidth: '1200px',
        margin: '0 auto',
        height: '76vh',
        overflowY: 'auto'
      }}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Box
          key={index}
          sx={{
            width: 300,
            height: 300,
            borderRadius: '10px',
            border: '1px solid rgba(160, 160, 160, 0.5)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <SkeletonBox width='100%' height={150} radius='0' />
          <Box
            sx={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <SkeletonBox width='70%' height={20} />
            <SkeletonText
              lines={2}
              widths={['100%', '80%']}
              lineHeight={12}
              gap={8}
            />
          </Box>
          <SkeletonRow
            style={{
              padding: '0 16px 16px',
              justifyContent: 'flex-start',
              gap: '10px'
            }}
          >
            <SkeletonBox width={74} height={22} />
            <SkeletonBox width={54} height={22} />
          </SkeletonRow>
        </Box>
      ))}
    </Box>
  </SkeletonStatusRegion>
)

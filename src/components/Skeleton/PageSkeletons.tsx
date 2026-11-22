import {
  SkeletonBox,
  SkeletonDot,
  SkeletonLines,
  SkeletonRow,
  SkeletonStatusRegion,
  SkeletonText
} from './Skeleton'
import {
  SkeletonCardShell,
  SkeletonCardsRow,
  SkeletonCenteredColumn,
  SkeletonHeroColumn,
  SkeletonHeroFooter,
  SkeletonHeroImage,
  SkeletonHeroTitle,
  SkeletonProjectActions,
  SkeletonProjectBody,
  SkeletonProjectCard,
  SkeletonProjectsList,
  SkeletonSkillsSection
} from './Skeleton.styled'

export const HomeContentSkeleton = () => (
  <SkeletonStatusRegion label='Carregando apresentação…'>
    <SkeletonHeroColumn>
      <SkeletonRow style={{ justifyContent: 'flex-start', gap: '10px' }}>
        <SkeletonDot size={16} />
        <SkeletonBox width={168} height={16} />
      </SkeletonRow>

      <SkeletonHeroTitle>
        <SkeletonBox width='78%' height={38} radius={10} />
      </SkeletonHeroTitle>

      <SkeletonText lines={3} widths={['100%', '92%', '58%']} lineHeight={14} />

      <SkeletonHeroFooter>
        <SkeletonBox width={172} height={16} />
      </SkeletonHeroFooter>
    </SkeletonHeroColumn>
  </SkeletonStatusRegion>
)

export const HomeImageSkeleton = () => (
  <SkeletonStatusRegion label='Carregando foto…'>
    <SkeletonHeroImage>
      <SkeletonDot size='500px' />
    </SkeletonHeroImage>
  </SkeletonStatusRegion>
)

/**
 * O "Sobre mim" é uma coluna única centralizada desde que o vídeo saiu da
 * página: o placeholder antigo desenhava duas colunas com um bloco 16:9 no
 * lugar do player e colapsava quando o conteúdo real chegava.
 */
export const AboutSkeleton = () => (
  <SkeletonStatusRegion label='Carregando sobre mim…'>
    <SkeletonCenteredColumn>
      <SkeletonLines style={{ gap: '22px' }}>
        <SkeletonText lines={3} widths={['100%', '96%', '72%']} />
        <SkeletonText lines={2} widths={['98%', '64%']} />
        <SkeletonText lines={2} widths={['94%', '48%']} />
      </SkeletonLines>
    </SkeletonCenteredColumn>
  </SkeletonStatusRegion>
)

export const SkillsSkeleton = () => (
  <SkeletonStatusRegion label='Carregando habilidades…'>
    <SkeletonSkillsSection>
      <SkeletonCardsRow>
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
      </SkeletonCardsRow>
    </SkeletonSkillsSection>
  </SkeletonStatusRegion>
)

export const ProjectsSkeleton = () => (
  <SkeletonStatusRegion label='Carregando projetos…'>
    <SkeletonProjectsList>
      {Array.from({ length: 6 }, (_, index) => (
        <SkeletonProjectCard key={index}>
          <SkeletonBox width='100%' height={150} radius='0' />
          <SkeletonProjectBody>
            <SkeletonBox width='70%' height={20} />
            <SkeletonText
              lines={2}
              widths={['100%', '80%']}
              lineHeight={12}
              gap={8}
            />
          </SkeletonProjectBody>
          <SkeletonProjectActions>
            <SkeletonBox width={74} height={22} />
            <SkeletonBox width={54} height={22} />
          </SkeletonProjectActions>
        </SkeletonProjectCard>
      ))}
    </SkeletonProjectsList>
  </SkeletonStatusRegion>
)

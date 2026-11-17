import { SkillsSkeleton } from '@/components/Skeleton'
import { Container, Grid } from '@mui/material'
import {
  CardHeader,
  CardStyled,
  Decoration,
  SkillRating,
  SkillRow
} from './Card.styled'
import { Skill, SkillCategory } from '@/@types/portfolio.entity'
import { useLanguage } from '@/store/language.store'

/**
 * Categorias que mostram o nível como texto em vez de estrelas.
 * Centralizado aqui para não repetir a comparação de título (que é texto
 * traduzido) em cada linha do JSX.
 */
const CATEGORIES_WITHOUT_RATING = new Set([
  'Languages',
  'Others',
  'Soft Skills'
])

const hasRating = (categoryTitle: string): boolean =>
  !CATEGORIES_WITHOUT_RATING.has(categoryTitle)

const Card = () => {
  const { data, isLoading } = useLanguage()

  const { skillsDetails } = data

  if (isLoading) return <SkillsSkeleton />

  return (
    <Container
      component='main'
      maxWidth={false}
      sx={{ maxWidth: '900px', marginTop: '-30px' }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          gap: '30px',
          justifyContent: 'center',
          position: 'relative',
          zIndex: '10'
        }}
      >
        <Decoration $top='-20px' $left='60px' />
        {skillsDetails?.map((category: SkillCategory) => (
          <CardStyled key={category.title}>
            <Decoration $bottom='-10px' $right='90px' />
            <CardHeader>
              <h3>{category.title}</h3>
              <p>{hasRating(category.title) ? 'Skill Level' : ''}</p>
            </CardHeader>
            {category.skills.map((skill: Skill) => (
              <SkillRow key={skill.name}>
                <h4>{skill.name}</h4>
                {hasRating(category.title) ? (
                  <SkillRating name='read-only' value={skill.level} readOnly />
                ) : (
                  <p>{skill.level}</p>
                )}
              </SkillRow>
            ))}
          </CardStyled>
        ))}
        <Decoration $bottom='-10px' $right='90px' />
      </Grid>
    </Container>
  )
}

export default Card

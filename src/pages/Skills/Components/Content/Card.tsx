import { useMemo } from 'react'
import { SkillsSkeleton } from '@/components/Skeleton'
import { Container, Grid } from '@mui/material'
import {
  CardHeader,
  CardStyled,
  DecorationsLayer,
  Dot,
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

/** Quantidade de bolinhas decorativas espalhadas atrás dos cards. */
const DOTS_PER_SIDE = 3

interface IDecoration {
  id: number
  top: string
  left: string
  size: number
}

const randomInt = (min: number, max: number): number =>
  Math.round(min + Math.random() * (max - min))

/**
 * Sorteia as bolinhas uma vez por montagem (useMemo de deps vazia), mas dentro
 * das MARGENS do grid: posição aleatória no miolo esconderia quase todas atrás
 * dos cards (eles ocupam o centro), então cada bolinha cai em uma faixa onde
 * fica visível espiando ao lado dos cards.
 */
const useRandomDecorations = (): IDecoration[] =>
  useMemo(() => {
    const dots: IDecoration[] = []

    for (let index = 0; index < DOTS_PER_SIDE; index += 1) {
      // Cada bolinha fica na sua faixa vertical (4-28%, 34-58%, 64-88%) para
      // não empilharem duas no mesmo ponto por azar do sorteio.
      const faixa = 4 + index * 30

      dots.push({
        id: dots.length,
        top: `${randomInt(faixa, faixa + 24)}%`,
        left: `${randomInt(0, 8)}%`,
        size: randomInt(30, 70)
      })
      dots.push({
        id: dots.length,
        top: `${randomInt(faixa, faixa + 24)}%`,
        left: `${randomInt(92, 99)}%`,
        size: randomInt(30, 70)
      })
    }

    dots.push({
      id: dots.length,
      top: '-18px',
      left: `${randomInt(10, 40)}%`,
      size: randomInt(36, 64)
    })
    dots.push({
      id: dots.length,
      top: '97%',
      left: `${randomInt(55, 88)}%`,
      size: randomInt(36, 64)
    })

    return dots
  }, [])

const Card = () => {
  const { data, isLoading } = useLanguage()
  const decorations = useRandomDecorations()

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
        <DecorationsLayer aria-hidden='true'>
          {decorations.map(dot => (
            <Dot
              key={dot.id}
              $top={dot.top}
              $left={dot.left}
              $size={dot.size}
            />
          ))}
        </DecorationsLayer>
        {skillsDetails?.map((category: SkillCategory) => (
          <CardStyled key={category.title}>
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
      </Grid>
    </Container>
  )
}

export default Card

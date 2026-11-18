import { useMemo } from 'react'
import { SkillsSkeleton } from '@/components/Skeleton'
import { Container } from '@mui/material'
import {
  CardHeader,
  CardStyled,
  DecorationsLayer,
  Dot,
  SkillRating,
  SkillRow,
  SkillsGrid,
  SkillsList
} from './Card.styled'
import { Skill, SkillCategory } from '@/@types/portfolio.entity'
import { useLanguage } from '@/store/language.store'

/**
 * Só quem tem `level` numérico ganha estrelas. O critério anterior era comparar
 * o título da categoria com uma lista fixa em inglês ("Languages", "Others") —
 * nunca batia com o dado real ("Idiomas", "Outras habilidades") e sobravam
 * fileiras de estrelas vazias nas categorias sem nota.
 */
const hasNumericLevel = (skill: Skill): boolean =>
  typeof skill.level === 'number'

/** Quantidade de bolinhas decorativas por lado. */
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
 * Sorteia as bolinhas uma vez por montagem (useMemo de deps vazia). Os cards
 * ficam um embaixo do outro ocupando toda a largura, então as posições se
 * concentram nas margens/beiradas: no meio elas apareceriam só como um brilho
 * desfocado atrás do vidro.
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
        left: `${randomInt(0, 6)}%`,
        size: randomInt(34, 78)
      })
      dots.push({
        id: dots.length,
        top: `${randomInt(faixa, faixa + 24)}%`,
        left: `${randomInt(94, 99)}%`,
        size: randomInt(34, 78)
      })
    }

    dots.push({
      id: dots.length,
      top: '2px',
      left: `${randomInt(10, 40)}%`,
      size: randomInt(40, 70)
    })
    dots.push({
      id: dots.length,
      top: 'calc(100% - 76px)',
      left: `${randomInt(55, 88)}%`,
      size: randomInt(40, 70)
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
      sx={{ maxWidth: '900px', marginTop: '-30px', paddingBottom: '6rem' }}
    >
      <SkillsList>
        <DecorationsLayer aria-hidden='true' data-testid='skills-decorations'>
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
          <CardStyled key={category.title} aria-label={category.title}>
            <CardHeader>
              <h2>{category.title}</h2>
              <p>
                {category.skills.some(hasNumericLevel) ? 'Skill Level' : ''}
              </p>
            </CardHeader>
            <SkillsGrid>
              {category.skills.map((skill: Skill) => (
                <SkillRow key={skill.name}>
                  <h3>{skill.name}</h3>
                  {hasNumericLevel(skill) ? (
                    <SkillRating
                      name='read-only'
                      value={skill.level}
                      readOnly
                    />
                  ) : null}
                </SkillRow>
              ))}
            </SkillsGrid>
          </CardStyled>
        ))}
      </SkillsList>
    </Container>
  )
}

export default Card

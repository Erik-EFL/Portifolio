import { describe, expect, it, vi } from 'vitest'
import Card from './Card'
import { renderWithProviders, screen, within } from '@/test/utils'
import type { SkillCategory } from '@/@types/portfolio.entity'

const categorias: SkillCategory[] = [
  {
    title: 'Front-end',
    skills: [
      { name: 'React', level: 4 },
      { name: 'TypeScript', level: 5 },
      { name: 'Styled Components', level: 4 }
    ]
  },
  {
    title: 'Outras habilidades',
    skills: [{ name: 'Scrum' }, { name: 'Kanban' }]
  }
]

const mockUseLanguage = vi.fn()

vi.mock('@/store/language.store', () => ({
  useLanguage: () => mockUseLanguage()
}))

const montar = (skillsDetails: SkillCategory[], isLoading = false) => {
  mockUseLanguage.mockReturnValue({
    data: { skillsDetails },
    isLoading
  })

  return renderWithProviders(<Card />)
}

describe('Skills / Card', () => {
  it('renderiza um card por categoria, com as skills dentro', () => {
    montar(categorias)

    const cards = screen.getAllByRole('region')
    expect(cards).toHaveLength(2)

    const frontend = cards[0]
    expect(
      within(frontend).getByRole('heading', { name: 'Front-end' })
    ).toBeInTheDocument()
    expect(within(frontend).getByText('Styled Components')).toBeInTheDocument()
  })

  it('mostra estrelas só em skill com nível numérico', () => {
    montar(categorias)

    const [frontend, outras] = screen.getAllByRole('region')

    // 3 skills com nota na primeira categoria (MUI Rating readOnly = role img)
    expect(within(frontend).getAllByRole('img')).toHaveLength(3)
    expect(within(frontend).getByLabelText('5 Stars')).toBeInTheDocument()
    // categoria sem nota não renderiza nota nenhuma (antes saíam estrelas vazias)
    expect(within(outras).queryAllByRole('img')).toHaveLength(0)
    expect(within(outras).getByText('Scrum')).toBeInTheDocument()
  })

  it('anuncia "Skill Level" apenas nas categorias que têm nota', () => {
    montar(categorias)

    const [frontend, outras] = screen.getAllByRole('region')

    expect(within(frontend).getByText('Skill Level')).toBeInTheDocument()
    expect(within(outras).queryByText('Skill Level')).not.toBeInTheDocument()
  })

  it('desenha a camada de bolinhas atrás dos cards (aria-hidden)', () => {
    montar(categorias)

    const camada = screen.getByTestId('skills-decorations')
    expect(camada).toHaveAttribute('aria-hidden', 'true')
    // 3 por lado + 1 no topo + 1 na base
    expect(camada.children).toHaveLength(8)
  })

  it('mostra o skeleton enquanto carrega', () => {
    montar([], true)

    expect(screen.queryAllByRole('region')).toHaveLength(0)
  })
})

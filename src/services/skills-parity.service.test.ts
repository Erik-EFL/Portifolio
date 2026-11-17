import { describe, expect, it } from 'vitest'
import staticData from '@/constant/Data/data.json'
import type { LocalizedSection, SkillCategory } from '@/@types/portfolio.entity'
import {
  alignSkillsSections,
  getSkillsParityIssues,
  isSkillsParitySection
} from './skills-parity.service'

const categoria = (
  title: string,
  nomes: string[],
  level?: number
): SkillCategory => ({
  title,
  skills: nomes.map(name => (level === undefined ? { name } : { name, level }))
})

const bloco = (
  language: 'ptBR' | 'enUS',
  items: SkillCategory[]
): LocalizedSection<SkillCategory> => ({ language, items })

const secao = (ptBR: SkillCategory[], enUS: SkillCategory[]) => [
  bloco('ptBR', ptBR),
  bloco('enUS', enUS)
]

describe('isSkillsParitySection', () => {
  it('vale só para skills e skillsDetails', () => {
    expect(isSkillsParitySection('skills')).toBe(true)
    expect(isSkillsParitySection('skillsDetails')).toBe(true)
    expect(isSkillsParitySection('home')).toBe(false)
    expect(isSkillsParitySection('navigation')).toBe(false)
  })
})

describe('getSkillsParityIssues', () => {
  it('não reclama quando os dois idiomas têm a mesma estrutura', () => {
    const value = secao(
      [categoria('Front-end', ['React', 'CSS'], 4)],
      [categoria('Front-end', ['React', 'CSS'], 4)]
    )

    expect(getSkillsParityIssues(value)).toEqual([])
  })

  it('aceita títulos diferentes (são tradução), desde que a estrutura bata', () => {
    const value = secao(
      [categoria('Ferramentas', ['VS Code'])],
      [categoria('Tools', ['VS Code'])]
    )

    expect(getSkillsParityIssues(value)).toEqual([])
  })

  it('acusa categoria que existe em um idioma só', () => {
    const value = secao(
      [categoria('Front-end', ['React'])],
      [categoria('Soft Skills', ['Empathy']), categoria('Front-end', ['React'])]
    )

    const issues = getSkillsParityIssues(value)

    // uma diferença só, no tamanho dos blocos: comparar índice a índice aqui
    // compararia categorias diferentes
    expect(issues).toHaveLength(1)
    expect(issues[0].detail).toMatch(/ptBR tem 1 categoria\(s\) e enUS tem 2/)
  })

  it('acusa skill adicionada em um idioma só', () => {
    const value = secao(
      [categoria('Front-end', ['React', 'Vite'])],
      [categoria('Front-end', ['React'])]
    )

    const issues = getSkillsParityIssues(value)

    expect(issues).toHaveLength(1)
    expect(issues[0].category).toBe('Front-end')
    expect(issues[0].detail).toMatch(/ptBR tem 2 skill\(s\) e enUS tem 1/)
  })

  it('acusa bloco de idioma ausente', () => {
    const issues = getSkillsParityIssues([
      bloco('ptBR', [categoria('Front-end', ['React'])])
    ])

    expect(issues[0].detail).toMatch(/Sem bloco de conteúdo para: enUS/)
  })

  it('não explode com lixo no lugar da seção', () => {
    expect(getSkillsParityIssues(null)).toHaveLength(1)
    expect(getSkillsParityIssues({ items: [] })).toHaveLength(1)
  })
})

describe('conteúdo estático do repositório', () => {
  it('tem skills e skillsDetails alinhados entre ptBR e enUS', () => {
    expect(getSkillsParityIssues(staticData.skills)).toEqual([])
    expect(getSkillsParityIssues(staticData.skillsDetails)).toEqual([])
  })
})

describe('alignSkillsSections', () => {
  it('completa o bloco que tem menos categorias, acrescentando no fim', () => {
    const value = secao(
      [categoria('Front-end', ['React'])],
      [categoria('Soft Skills', ['Empathy']), categoria('Front-end', ['React'])]
    )

    const alinhado = alignSkillsSections(
      value
    ) as LocalizedSection<SkillCategory>[]
    const [pt, en] = alinhado

    expect(pt.items).toHaveLength(2)
    expect(en.items).toHaveLength(2)
    // a categoria vazia entra no fim, já com uma skill vazia para casar com a
    // do outro idioma: mover/renomear é decisão editorial, não do botão
    expect(pt.items[0]).toEqual(categoria('Front-end', ['React']))
    expect(pt.items[1]).toEqual({ title: '', skills: [{ name: '' }] })
    expect(getSkillsParityIssues(alinhado)).toEqual([])
  })

  it('acrescenta a skill faltante com nome vazio e preserva as existentes', () => {
    const value = secao(
      [categoria('Front-end', ['React', 'Vite'], 4)],
      [categoria('Front-end', ['React'], 4)]
    )

    const alinhado = alignSkillsSections(
      value
    ) as LocalizedSection<SkillCategory>[]

    expect(alinhado[0].items[0].skills).toEqual([
      { name: 'React', level: 4 },
      { name: 'Vite', level: 4 }
    ])
    expect(alinhado[1].items[0].skills).toEqual([
      { name: 'React', level: 4 },
      { name: '' }
    ])
    expect(getSkillsParityIssues(alinhado)).toEqual([])
  })

  it('não muta a seção original e mantém a ordem dos blocos', () => {
    const value = secao(
      [categoria('Front-end', ['React', 'Vite'])],
      [categoria('Front-end', ['React'])]
    )
    const antes = JSON.stringify(value)

    const alinhado = alignSkillsSections(
      value
    ) as LocalizedSection<SkillCategory>[]

    expect(JSON.stringify(value)).toBe(antes)
    expect(alinhado.map(bloco => bloco.language)).toEqual(['ptBR', 'enUS'])
  })

  it('devolve o valor como veio quando não é lista', () => {
    expect(alignSkillsSections('texto')).toBe('texto')
    expect(alignSkillsSections(null)).toBeNull()
  })
})

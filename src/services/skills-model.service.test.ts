import { describe, expect, it } from 'vitest'
import type { SkillCategory } from '@/@types/portfolio.entity'
import {
  isSkillsSection,
  normalizeSkillCategories,
  resolveSkillCategories,
  resolveText
} from './skills-model.service'

const categoria = (
  title: string,
  nomes: string[],
  extras: Partial<SkillCategory> = {}
): SkillCategory => ({
  title,
  skills: nomes.map(name => ({ name })),
  ...extras
})

const formatoAntigo = (ptBR: SkillCategory[], enUS: SkillCategory[]) => [
  { language: 'ptBR', items: ptBR },
  { language: 'enUS', items: enUS }
]

describe('isSkillsSection', () => {
  it('vale só para skills e skillsDetails', () => {
    expect(isSkillsSection('skills')).toBe(true)
    expect(isSkillsSection('skillsDetails')).toBe(true)
    expect(isSkillsSection('home')).toBe(false)
  })
})

describe('resolveText', () => {
  it('usa a tradução quando existe e o texto base quando não', () => {
    expect(resolveText('React', undefined, 'enUS')).toBe('React')
    expect(
      resolveText('Boa comunicação', { enUS: 'Good communication' }, 'enUS')
    ).toBe('Good communication')
    expect(
      resolveText('Boa comunicação', { enUS: 'Good communication' }, 'ptBR')
    ).toBe('Boa comunicação')
  })

  it('tradução vazia não vale: cai no texto base', () => {
    expect(resolveText('Tools', { enUS: '   ' }, 'enUS')).toBe('Tools')
  })
})

describe('normalizeSkillCategories', () => {
  it('aceita a lista única e preserva traduções e níveis', () => {
    const entrada = [
      {
        title: 'Ferramentas',
        translations: { enUS: 'Tools' },
        skills: [
          { name: 'VS Code', level: 5 },
          {
            name: 'Boa comunicação',
            translations: { enUS: 'Good communication' }
          }
        ]
      }
    ]

    expect(normalizeSkillCategories(entrada)).toEqual(entrada)
  })

  it('migra o formato antigo (dois blocos) para uma lista só', () => {
    const antigo = formatoAntigo(
      [categoria('Ferramentas', ['VS Code', 'Figma'])],
      [categoria('Tools', ['VS Code', 'Figma'])]
    )

    expect(normalizeSkillCategories(antigo)).toEqual([
      {
        title: 'Ferramentas',
        translations: { enUS: 'Tools' },
        skills: [{ name: 'VS Code' }, { name: 'Figma' }]
      }
    ])
  })

  it('usa a lista em português como fonte e não inventa tradução de nome', () => {
    const antigo = formatoAntigo(
      [categoria('Soft Skills', ['Empatia'])],
      [categoria('Soft Skills', ['Empathy'])]
    )

    // o nome do outro bloco não vira tradução de skill: os nomes já são em
    // inglês nos dois blocos e parear por índice inventava troca (Tailwind →
    // Bootstrap). Tradução de nome só existe no formato de lista única.
    expect(normalizeSkillCategories(antigo)).toEqual([
      { title: 'Soft Skills', skills: [{ name: 'Empatia' }] }
    ])
  })

  it('descarta lugar vazio do bloco em português', () => {
    // O bloco ptBR do conteúdo real ficou com placeholders vazios no Back-end:
    // cada um renderizava linha em branco e repetia a key "".
    const antigo = formatoAntigo(
      [categoria('Back-end', ['Node.js', '', ''])],
      [categoria('Back-end', ['Node.js', 'Prisma', 'Sequelize'])]
    )

    const normalizado = normalizeSkillCategories(antigo) ?? []

    expect(normalizado[0].skills.map(skill => skill.name)).toEqual(['Node.js'])
  })

  it('não mistura a composição do bloco em inglês', () => {
    const antigo = formatoAntigo(
      [categoria('Front-end', ['React', 'Zustand'])],
      [categoria('Front-end', ['React', 'Bootstrap'])]
    )

    const normalizado = normalizeSkillCategories(antigo) ?? []

    expect(normalizado.map(categoria => categoria.title)).toEqual(['Front-end'])
    expect(normalizado[0].skills.map(skill => skill.name)).toEqual([
      'React',
      'Zustand'
    ])
  })

  it('aproveita o título da categoria no outro idioma', () => {
    const antigo = formatoAntigo(
      [categoria('Idiomas', ['Portuguese'])],
      [categoria('Spoken languages', ['Portuguese'])]
    )

    expect(normalizeSkillCategories(antigo)).toEqual([
      {
        title: 'Idiomas',
        translations: { enUS: 'Spoken languages' },
        skills: [{ name: 'Portuguese' }]
      }
    ])
  })

  it('recusa lista com item inválido em vez de entregar lista parcial', () => {
    expect(
      normalizeSkillCategories([{ title: 'ok', skills: [] }, null])
    ).toBeUndefined()
    expect(normalizeSkillCategories({ items: [] })).toBeUndefined()
    expect(normalizeSkillCategories('texto')).toBeUndefined()
  })
})

describe('resolveSkillCategories', () => {
  it('descarta skill sem texto em nenhum idioma', () => {
    const categorias: SkillCategory[] = [
      {
        title: 'Back-end',
        skills: [{ name: 'Node.js' }, { name: '' }, { name: '   ' }]
      }
    ]

    expect(
      resolveSkillCategories(categorias, 'ptBR')[0].skills.map(
        skill => skill.name
      )
    ).toEqual(['Node.js'])
    expect(
      resolveSkillCategories(categorias, 'enUS')[0].skills.map(
        skill => skill.name
      )
    ).toEqual(['Node.js'])
  })

  it('usa a única tradução existente quando a base está vazia', () => {
    const categorias: SkillCategory[] = [
      {
        title: 'Back-end',
        skills: [{ name: '', translations: { enUS: 'Prisma' } }]
      }
    ]

    // ptBR não tem tradução: mostra o texto que existe em vez de linha vazia
    expect(resolveSkillCategories(categorias, 'ptBR')[0].skills[0].name).toBe(
      'Prisma'
    )
    expect(resolveSkillCategories(categorias, 'enUS')[0].skills[0].name).toBe(
      'Prisma'
    )
  })

  it('entrega os textos no idioma pedido', () => {
    const categorias: SkillCategory[] = [
      {
        title: 'Idiomas',
        translations: { enUS: 'Spoken languages' },
        skills: [
          { name: 'Português', level: 5, translations: { enUS: 'Portuguese' } },
          { name: 'Inglês', level: 4 }
        ]
      }
    ]

    expect(resolveSkillCategories(categorias, 'ptBR')[0]).toMatchObject({
      title: 'Idiomas',
      skills: [{ name: 'Português' }, { name: 'Inglês' }]
    })

    const emIngles = resolveSkillCategories(categorias, 'enUS')[0]

    expect(emIngles.title).toBe('Spoken languages')
    expect(emIngles.skills.map(skill => skill.name)).toEqual([
      'Portuguese',
      'Inglês'
    ])
    // nível continua igual nos dois idiomas
    expect(emIngles.skills[0].level).toBe(5)
  })
})

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

  it('guarda a tradução só onde o texto realmente muda', () => {
    const antigo = formatoAntigo(
      [categoria('Soft Skills', ['Empatia'])],
      [categoria('Soft Skills', ['Empathy'])]
    )

    expect(normalizeSkillCategories(antigo)).toEqual([
      {
        title: 'Soft Skills',
        skills: [{ name: 'Empatia', translations: { enUS: 'Empathy' } }]
      }
    ])
  })

  it('preserva a skill que existia em um idioma só', () => {
    const antigo = formatoAntigo(
      [categoria('Front-end', ['React'])],
      [categoria('Soft Skills', ['Empathy']), categoria('Front-end', ['React'])]
    )

    const normalizado = normalizeSkillCategories(antigo) ?? []

    // o bloco maior vira a base, então nada se perde
    expect(normalizado).toHaveLength(2)
    expect(normalizado[0].title).toBe('Soft Skills')
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

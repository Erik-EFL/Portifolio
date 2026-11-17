import { describe, expect, it } from 'vitest'
import { getEditorValidation } from './Admin.utils'

const documento = (key: string, value: unknown) =>
  JSON.stringify({ [key]: value })

const categoria = (title: string, nomes: string[]) => ({
  title,
  skills: nomes.map(name => ({ name }))
})

describe('getEditorValidation', () => {
  it('recusa JSON quebrado', () => {
    const resultado = getEditorValidation('{', 'skills')

    expect(resultado.valid).toBe(false)
  })

  it('aceita skills como lista única (uma fonte de verdade)', () => {
    const texto = documento('skills', [
      categoria('Soft Skills', ['Comunicação']),
      categoria('Linguagens', ['Português'])
    ])

    const resultado = getEditorValidation(texto, 'skills')

    expect(resultado.valid).toBe(true)
    expect(resultado.valid ? resultado.row.key : '').toBe('skills')
  })

  it('mantém a tradução embutida na mesma entrada', () => {
    const texto = documento('skillsDetails', [
      {
        title: 'Ferramentas',
        translations: { enUS: 'Tools' },
        skills: [{ name: 'VS Code', level: 5 }]
      }
    ])

    const resultado = getEditorValidation(texto, 'skillsDetails')

    expect(resultado.valid).toBe(true)

    if (resultado.valid) {
      const valor = resultado.row.value as unknown as Array<
        Record<string, unknown>
      >

      expect(valor[0].translations).toEqual({ enUS: 'Tools' })
    }
  })

  it('aceita o formato antigo e normaliza para a lista única', () => {
    const texto = documento('skillsDetails', [
      { language: 'ptBR', items: [categoria('Ferramentas', ['VS Code'])] },
      { language: 'enUS', items: [categoria('Tools', ['VS Code'])] }
    ])

    const resultado = getEditorValidation(texto, 'skillsDetails')

    expect(resultado.valid).toBe(true)

    if (resultado.valid) {
      const valor = resultado.row.value as unknown as Array<
        Record<string, unknown> & { skills: unknown[] }
      >

      // virou lista única: sem blocos `language`, com o título base em ptBR
      expect(valor).toHaveLength(1)
      expect('language' in valor[0]).toBe(false)
      expect(valor[0].title).toBe('Ferramentas')
      expect(valor[0].translations).toEqual({ enUS: 'Tools' })
    }
  })

  it('recusa skills com item malformado', () => {
    const texto = documento('skillsDetails', [{ title: 'ok', skills: [null] }])

    expect(getEditorValidation(texto, 'skillsDetails').valid).toBe(false)
  })

  it('não aplica nada disso às outras seções', () => {
    const texto = documento('footerCopyright', [
      { language: 'ptBR', items: [{ copyright: '© 2026' }] }
    ])

    expect(getEditorValidation(texto, 'footerCopyright').valid).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { getEditorValidation } from './Admin.utils'

const documento = (key: string, value: unknown) =>
  JSON.stringify({ [key]: value })

const bloco = (
  language: 'ptBR' | 'enUS',
  titulo: string,
  skills: string[]
) => ({
  language,
  items: [{ title: titulo, skills: skills.map(name => ({ name })) }]
})

describe('getEditorValidation', () => {
  it('recusa JSON quebrado', () => {
    const resultado = getEditorValidation('{', 'skills')

    expect(resultado.valid).toBe(false)
  })

  it('recusa skillsDetails com idiomas desalinhados', () => {
    const texto = documento('skillsDetails', [
      bloco('ptBR', 'Front-end', ['React', 'Vite']),
      bloco('enUS', 'Front-end', ['React'])
    ])

    const resultado = getEditorValidation(texto, 'skillsDetails')

    expect(resultado.valid).toBe(false)
    expect(resultado.valid ? '' : resultado.message).toMatch(
      /Idiomas desalinhados/
    )
    expect(resultado.valid ? '' : resultado.message).toMatch(/Front-end/)
  })

  it('recusa categoria que existe em um idioma só', () => {
    const texto = documento('skillsDetails', [
      {
        language: 'ptBR',
        items: [{ title: 'Front-end', skills: [{ name: 'React' }] }]
      },
      {
        language: 'enUS',
        items: [
          { title: 'Front-end', skills: [{ name: 'React' }] },
          { title: 'Soft Skills', skills: [{ name: 'Empathy' }] }
        ]
      }
    ])

    const resultado = getEditorValidation(texto, 'skillsDetails')

    expect(resultado.valid).toBe(false)
    expect(resultado.valid ? '' : resultado.message).toMatch(/categoria/)
  })

  it('aceita quando ptBR e enUS têm a mesma estrutura', () => {
    const texto = documento('skills', [
      bloco('ptBR', 'Soft Skills', ['Comunicação']),
      bloco('enUS', 'Soft Skills', ['Communication'])
    ])

    const resultado = getEditorValidation(texto, 'skills')

    expect(resultado.valid).toBe(true)
    expect(resultado.valid ? resultado.row.key : '').toBe('skills')
  })

  it('não aplica a regra de idiomas às outras seções', () => {
    const texto = documento('footerCopyright', [
      { language: 'ptBR', items: [{ copyright: '© 2026' }] }
    ])

    expect(getEditorValidation(texto, 'footerCopyright').valid).toBe(true)
  })
})

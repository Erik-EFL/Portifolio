import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SkillCategory } from '@/@types/portfolio.entity'
import { SectionEditor } from './Admin.section-editor'

const listaUnica: SkillCategory[] = [
  {
    title: 'Ferramentas',
    translations: { enUS: 'Tools' },
    skills: [
      { name: 'VS Code', level: 5 },
      { name: 'Figma', level: 4 }
    ]
  }
]

const montar = (value: SkillCategory[]) => {
  const setNotice = vi.fn()

  render(
    <SectionEditor
      keyName='skillsDetails'
      value={value}
      remoteRow={undefined}
      canMutate
      onSave={vi.fn()}
      onDelete={vi.fn()}
      isSaving={false}
      isDeleting={false}
      notice=''
      setNotice={setNotice}
    />
  )

  const textarea = screen.getByLabelText(
    'Section JSON for skillsDetails'
  ) as HTMLTextAreaElement

  return { textarea, setNotice }
}

const lerJson = (textarea: HTMLTextAreaElement) =>
  JSON.parse(textarea.value) as { skillsDetails: SkillCategory[] }

describe('Admin / SectionEditor (skillsDetails)', () => {
  it('mostra a lista única com o nome base e a tradução na mesma linha', () => {
    montar(listaUnica)

    expect(
      screen.getByLabelText('Título da categoria 1 (português)')
    ).toHaveValue('Ferramentas')
    expect(
      screen.getByLabelText('Tradução em inglês do título da categoria 1')
    ).toHaveValue('Tools')
    expect(screen.getByLabelText('Nome da skill 1 (português)')).toHaveValue(
      'VS Code'
    )
    // skill sem tradução fica com o campo de inglês vazio
    expect(screen.getByLabelText('Tradução em inglês da skill 2')).toHaveValue(
      ''
    )
  })

  it('editar o nome base não cria bloco por idioma (uma fonte só)', async () => {
    const { textarea } = montar(listaUnica)

    const campo = screen.getByLabelText('Nome da skill 1 (português)')
    await userEvent.clear(campo)
    await userEvent.type(campo, 'VS Code Insiders')

    const json = lerJson(textarea)

    expect(json.skillsDetails).toHaveLength(1)
    expect(json.skillsDetails[0].skills[0].name).toBe('VS Code Insiders')
    // continua uma lista de categorias, sem blocos com `language`
    expect('language' in json.skillsDetails[0]).toBe(false)
  })

  it('preencher o campo de inglês grava a tradução na mesma skill', async () => {
    const { textarea } = montar(listaUnica)

    await userEvent.type(
      screen.getByLabelText('Tradução em inglês da skill 2'),
      'Figma'
    )

    expect(lerJson(textarea).skillsDetails[0].skills[1]).toEqual({
      name: 'Figma',
      level: 4,
      translations: { enUS: 'Figma' }
    })
  })

  it('aceita o valor antigo (dois blocos) e o documento já sai em lista única', () => {
    // valor antigo vindo do banco: { language, items }[] — a seção é criada com
    // esse array, e a validação normaliza na leitura
    const { textarea } = montar([
      {
        title: 'Ferramentas',
        skills: [{ name: 'VS Code' }]
      }
    ] as unknown as SkillCategory[])

    expect(screen.getByText('Valid section JSON.')).toBeInTheDocument()

    const json = JSON.parse(textarea.value) as {
      skillsDetails: SkillCategory[]
    }

    expect(json.skillsDetails).toHaveLength(1)
    expect(json.skillsDetails[0].title).toBe('Ferramentas')
  })
})

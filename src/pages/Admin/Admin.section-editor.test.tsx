import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { IData } from '@/@types/portfolio.entity'
import { SectionEditor } from './Admin.section-editor'

const desalinhado: IData['skillsDetails'] = [
  {
    language: 'ptBR',
    items: [{ title: 'Front-end', skills: [{ name: 'React', level: 4 }] }]
  },
  {
    language: 'enUS',
    items: [
      { title: 'Front-end', skills: [{ name: 'React', level: 4 }] },
      { title: 'Soft Skills', skills: [{ name: 'Empathy' }] }
    ]
  }
]

const montar = (value: IData['skillsDetails']) => {
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

describe('Admin / SectionEditor (skillsDetails)', () => {
  it('bloqueia o salvar e explica o desalinhamento', () => {
    montar(desalinhado)

    expect(screen.getByText(/Idiomas desalinhados/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Atualizar Seção|Adicionar Seção/ })
    ).toBeDisabled()
  })

  it('o botão "Igualar idiomas" completa o bloco que ficou atrás', async () => {
    const { textarea, setNotice } = montar(desalinhado)

    await userEvent.click(
      screen.getByRole('button', { name: /Igualar idiomas/ })
    )

    const depois = JSON.parse(textarea.value) as {
      skillsDetails: IData['skillsDetails']
    }

    expect(depois.skillsDetails[0].items).toHaveLength(2)
    expect(depois.skillsDetails[1].items).toHaveLength(2)
    expect(setNotice).toHaveBeenCalledWith(
      expect.stringMatching(/Blocos alinhados/)
    )
    // com os blocos do mesmo tamanho o salvar volta a ficar disponível
    expect(screen.getByText('Valid section JSON.')).toBeInTheDocument()
  })
})

import { describe, expect, it, vi } from 'vitest'
import NavMobile from './Navegação.mobile'
import { renderWithProviders, screen } from '@/test/utils'
import type { NavigationLink } from '@/@types/portfolio.entity'

const mockUseLanguage = vi.fn()

vi.mock('@/store/language.store', () => ({
  useLanguage: () => mockUseLanguage()
}))

/**
 * `hidden: true` porque no jsdom a media query que exibe a barra (<=640px) não
 * é avaliada e sobra a regra base `display: none`.
 */
const montar = (navigation: NavigationLink[], route = '/') => {
  mockUseLanguage.mockReturnValue({ data: { navigation } })

  return renderWithProviders(<NavMobile />, { route })
}

describe('Navegação inferior (mobile)', () => {
  it('usa os rótulos traduzidos vindos do conteúdo, não a posição no array', () => {
    montar([
      { name: 'Home', link: '/' },
      { name: 'About', link: '/about' },
      { name: 'Skills', link: '/skills' },
      { name: 'Projects', link: '/projects' }
    ])

    const links = screen.getAllByRole('link', { hidden: true })

    expect(links.map(link => link.textContent)).toEqual([
      'Home',
      'About',
      'Skills',
      'Projects'
    ])
    expect(links[0]).toHaveAttribute('href', '/')
  })

  it('mantém a ordem fixa da barra e casa o rótulo pelo link', () => {
    // conteúdo em outra ordem: cada rótulo tem que ir para o seu próprio link
    montar([
      { name: 'Projects', link: '/projects' },
      { name: 'Home', link: '/' },
      { name: 'Skills', link: '/skills' },
      { name: 'About', link: '/about' }
    ])

    const links = screen.getAllByRole('link', { hidden: true })

    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/',
      '/about',
      '/skills',
      '/projects'
    ])
    expect(links.map(link => link.textContent)).toEqual([
      'Home',
      'About',
      'Skills',
      'Projects'
    ])
  })

  it('cai no rótulo padrão quando o conteúdo não tem aquele link', () => {
    montar([{ name: 'Início', link: '/' }])

    const links = screen.getAllByRole('link', { hidden: true })

    expect(links.map(link => link.textContent)).toEqual([
      'Início',
      'Sobre',
      'Habilidades',
      'Projetos'
    ])
  })

  it('marca como ativo o link da rota atual', () => {
    montar(
      [
        { name: 'Início', link: '/' },
        { name: 'Habilidades', link: '/skills' }
      ],
      '/skills'
    )

    const ativo = screen
      .getAllByRole('link', { hidden: true })
      .find(link => link.className.includes('active'))

    expect(ativo).toHaveTextContent('Habilidades')
    expect(ativo).toHaveAttribute('aria-current', 'page')
  })
})

import {
  BiBookOpen,
  BiBriefcase,
  BiComment,
  BiHome,
  BiMoon,
  BiSun
} from 'react-icons/bi'
import { NavLink } from 'react-router-dom'
import type { IconType } from 'react-icons'
import NavMenu from './Navegação.mobile.style'
import { useTheme } from '@/context/theme.context'
import { useLanguage } from '@/store/language.store'

/** Rotas da barra inferior, na ordem em que aparecem. */
const ITEMS: { link: string; icon: IconType; fallback: string }[] = [
  { link: '/', icon: BiHome, fallback: 'Início' },
  { link: '/about', icon: BiComment, fallback: 'Sobre' },
  { link: '/skills', icon: BiBriefcase, fallback: 'Habilidades' },
  { link: '/projects', icon: BiBookOpen, fallback: 'Projetos' }
]

/**
 * Navegação inferior do mobile. Os rótulos vêm do conteúdo (navegação
 * traduzida) buscados por LINK, não pela posição no array.
 *
 * O último botão troca o tema: no mobile o toggle do header e o do footer estão
 * escondidos, então sem ele não havia como mudar de tema no celular.
 */
export default function NavMobile() {
  const { data } = useLanguage()
  const { themeMode, switchTheme } = useTheme()

  const estaEscuro = themeMode === 'dark'

  return (
    <NavMenu aria-label='Navegação principal'>
      {ITEMS.map(({ link, icon: Icon, fallback }) => {
        const label = data.navigation.find(item => item.link === link)?.name

        return (
          <NavLink
            key={link}
            to={link}
            end={link === '/'}
            className={({ isActive }) =>
              isActive ? 'mobileLinks active' : 'mobileLinks'
            }
          >
            <span className='mobileIcon' aria-hidden='true'>
              <Icon />
            </span>
            {label ?? fallback}
          </NavLink>
        )
      })}
      <button
        type='button'
        className='mobileLinks mobileThemeButton'
        onClick={switchTheme}
        aria-pressed={estaEscuro}
        aria-label={estaEscuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
      >
        <span className='mobileIcon' aria-hidden='true'>
          {estaEscuro ? <BiSun /> : <BiMoon />}
        </span>
        {estaEscuro ? 'Claro' : 'Escuro'}
      </button>
    </NavMenu>
  )
}

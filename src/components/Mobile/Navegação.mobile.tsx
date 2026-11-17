import { BiBookOpen, BiBriefcase, BiComment, BiHome } from 'react-icons/bi'
import { NavLink } from 'react-router-dom'
import type { IconType } from 'react-icons'
import NavMenu from './Navegação.mobile.style'
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
 */
export default function NavMobile() {
  const { data } = useLanguage()

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
    </NavMenu>
  )
}

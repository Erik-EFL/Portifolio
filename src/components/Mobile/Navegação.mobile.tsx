import { useLanguage } from '@/store/language.store'
import { BiBookOpen, BiBriefcase, BiComment, BiHome } from 'react-icons/bi'
import { NavLink } from 'react-router-dom'
import NavMenu from './Navegação.mobile.style'

export default function NavMobile() {
  const { data } = useLanguage()

  const header = data?.navigation

  if (!header) return null

  return (
    <NavMenu className='bottonMenu'>
      <NavLink to='/' defaultValue='Home' className='mobileLinks'>
        <h1>
          <BiHome />
        </h1>
        <p>{header[0].name}</p>
      </NavLink>
      <NavLink to='/about' defaultValue='About' className='mobileLinks'>
        <h1>
          <BiComment />
        </h1>
        <p>{header[1].name}</p>
      </NavLink>
      <NavLink to='/skills' defaultValue='Skills' className='mobileLinks'>
        <h1>
          <BiBriefcase />
        </h1>
        <p>{header[2].name}</p>
      </NavLink>
      <NavLink to='/projects' defaultValue='Projects' className='mobileLinks'>
        <h1>
          <BiBookOpen />
        </h1>
        <p>{header[3].name}</p>
      </NavLink>
    </NavMenu>
  )
}

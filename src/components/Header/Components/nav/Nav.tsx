
import { NavLink } from 'react-router-dom'
import Contacts from '../Contacts/Contacts'
import { Container, NavMenu } from './Nav.style'
import { useLanguage } from '@/store/language.store';

export default function Nav() {
  const { data } = useLanguage()

  const { navigation } = data
  const filteredNavigation = navigation?.find(({ link }) => link === '/contact')?.link ?? '/contacts'

  if (!navigation) return <div>Loading...</div>

  return (
    <NavMenu className='navMenu'>
      <Container className='completeMenu'>
        {navigation?.map(({ link, name }) => (
          <NavLink
            key={link}
            to={link}
            className={({ isActive }) => (isActive ? 'active' : 'inactive')}
          >
            {name !== 'Contato' && name}
          </NavLink>
        ))}
        <Contacts link={filteredNavigation} />
      </Container>
    </NavMenu>
  )
}

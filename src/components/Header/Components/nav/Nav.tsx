import { NavLink } from 'react-router-dom'
import Contacts from '../Contacts/Contacts'
import { Container, NavMenu } from './Nav.style'
import { useLanguage } from '@/store/language.store'

/**
 * O item de contato do menu não é uma rota: é o botão que abre os ícones
 * sociais no mobile. Ele é identificado pelo link, nunca pelo texto traduzido.
 */
const CONTACT_LINK = '/contact'

export default function Nav() {
  const { data } = useLanguage()
  const { navigation } = data

  const contactItem = navigation.find(({ link }) => link === CONTACT_LINK)
  const menuLinks = navigation.filter(({ link }) => link !== CONTACT_LINK)

  return (
    <NavMenu className='navMenu'>
      <Container className='completeMenu'>
        {menuLinks.map(({ link, name }) => (
          <NavLink
            key={link}
            to={link}
            className={({ isActive }) => (isActive ? 'active' : 'inactive')}
          >
            {name}
          </NavLink>
        ))}
        <Contacts label={contactItem?.name ?? 'Contato'} />
      </Container>
    </NavMenu>
  )
}

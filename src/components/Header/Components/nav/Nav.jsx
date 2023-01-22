import React from 'react'
import { NavLink } from 'react-router-dom';
import useChangeLanguage from '../../../../Hooks/useChangeLanguage';
import { Container, NavMenu } from './Nav.style';
import Contacts from '../Contacts/Contacts';


export default function Nav() {
  const { data } = useChangeLanguage()

  const { header } = data

  if (!header) return <div>Loading...</div>

  const links = [
    { to: '/', label: header.link1 },
    { to: '/about', label: header.link2 },
    { to: '/skills', label: header.link3 },
    { to: '/projects', label: header.link4 }
  ]

  return (
    <NavMenu className='navMenu'>
      <Container className='completeMenu'>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            exact
            className={({isActive}) => (isActive ? 'active' : 'inactive')}
          >
            {label}
          </NavLink>
        ))}
        <Contacts link={header.link5} />
      </Container>
    </NavMenu>
  );
}

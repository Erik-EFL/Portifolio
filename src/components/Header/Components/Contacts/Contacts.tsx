import { useState } from 'react'
import SocialIcons from '../../../Icons/Icons_social'
import Container from './Contacts.styled'

interface IContacts {
  link: string
}

function Contacts({ link }: IContacts) {
  const [isActive, setIsActive] = useState(false)

  return (
    <Container className='menuContacts'>
      <button
        className={`${isActive ? 'is-open' : 'is-closed'} menu`}
        type='button'
        onClick={() => setIsActive(prevState => !prevState)}
      >
        {link}
      </button>
      <div className={`${isActive ? 'is-open' : 'is-closed'} contacts`}>
        <SocialIcons />
      </div>
    </Container>
  )
}

export default Contacts

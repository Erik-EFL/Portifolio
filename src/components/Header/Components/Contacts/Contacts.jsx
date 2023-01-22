import React, { useState } from 'react'
import Icons from '../../../Icons/Icons_social'
import Container from './Contacts.styled'
import PropTypes from 'prop-types'

function Contacts({ link }) {
  const [ isActive, setIsActive ] = useState(false)

  return (
    <Container className='menuContacts'>
      <button
        className={`${isActive ? "is-open" : "is-closed"} menu`}
        type='button'
        onClick={() => setIsActive(prevState => !prevState)}
      >
        {link}
      </button>
      <div className={`${isActive ? "is-open" : "is-closed"} contacts`}>
        <Icons />
      </div>
    </Container>
  )
}

Contacts.propTypes = {
  link: PropTypes.string.isRequired,
}

export default Contacts

import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types';
import { ToggleStyled } from './toggle.styles';
import { StyledInput } from '../../Input/Input.style';

function ToggleTheme({ toggleTheme, number }) {
  const { title } = useContext(ThemeContext);

  return (
      <ToggleStyled
        className='checkTheme'
      >
        <StyledInput
          type={"checkbox"}
          id={`change-Theme-color-${number}`}
          className='check-box-change-Theme-color'
          name={'check-box-change-Theme-color'}
          onChange={toggleTheme}
          checked={title === 'dark'}
          ariaLabel={'check-box-change-Theme-color'}
        />
        <label
          className="label"
          htmlFor={`change-Theme-color-${number}`}
          aria-label='Change Theme Color'
        >
          <FontAwesomeIcon className='fa-moon' icon={faMoon} />
          <FontAwesomeIcon className='fa-sun' icon={faSun} />
          <div
            className='ball'
          />
        </label>
      </ToggleStyled>
    )
  }

ToggleTheme.propTypes = {
  toggleTheme: PropTypes.func,
  number: PropTypes.number,
}

export default ToggleTheme

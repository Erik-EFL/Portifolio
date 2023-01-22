import React from 'react';
import Icons from '../Icons/Icons_social';
import Logo from './Components/logo/Logo';
import Nav from './Components/nav/Nav';
import HeaderStyled from './Header.style';
import PropTypes from 'prop-types';
import ToggleTheme from '../Toggle/Theme/Toggle.theme';

function Header({ toggleTheme }) {
  return (
    <>
      <HeaderStyled>
        <Logo />
        <Nav />
        <Icons />
        <ToggleTheme toggleTheme={toggleTheme} number={1} />
      </HeaderStyled>
    </>
  );
}

Header.propTypes = {
  toggleTheme: PropTypes.func,
};

export default Header;

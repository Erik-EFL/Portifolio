import React from 'react';
import CustomizedSwitches from '../Toggle/Language/Toggle';
import ToggleTheme from '../Toggle/Theme/Toggle.theme';
import { FooterContainer } from './Footer.style';
import PropTypes from 'prop-types';

export default function Footer({ toggleTheme }) {
  return (
    <>
      <FooterContainer>
        <p>© 2022 Copyright: Erik Ferreira de Lima</p>
        <CustomizedSwitches />
        <ToggleTheme toggleTheme={toggleTheme} number={2}/>
      </FooterContainer>
    </>
  );
}

Footer.propTypes = {
  toggleTheme: PropTypes.func,
};

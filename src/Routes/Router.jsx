import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from '../Global.style';
import { darkTheme, lightTheme } from '../Styles/Themes';

import pages from '../pages/export.pages'
import components from '../components/export.components'

const Router = () => {
  const [theme, setTheme] = useState(darkTheme);
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === darkTheme ? lightTheme : darkTheme));
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.getRegistration('/sw.js').then(function(registration) {
          if (!registration) {
              navigator.serviceWorker.register('/sw.js').then(function (registration) {
                  console.log('ServiceWorker registrado com sucesso: ', registration.scope);
              }).catch(function (err) {
                  console.log('ServiceWorker falha no registro: ', err);
              });
          } else {
              console.log('ServiceWorker já está registrado');
          }
      });
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <CssBaseline />
        <GlobalStyles />
          <components.Header toggleTheme={toggleTheme} number={1} />
        <Routes>
          {pages.map(({ Component, path, name }) => (
            <Route key={name} path={path} element={<Component />} />
          ))}
        </Routes>
        <components.NavMobile />
      </BrowserRouter>
      <components.Footer toggleTheme={toggleTheme} number={2} />
    </ThemeProvider>
  );
}

export default Router;

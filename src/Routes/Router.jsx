import CssBaseline from '@mui/material/CssBaseline';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../Global.style';
import { darkTheme, lightTheme } from '../Styles/Themes';

import components from '../components/export.components';
import pages from '../pages/export.pages';

const Router = () => {


  const storage = typeof window !== 'undefined' ? window.localStorage : {};

  const [theme, setTheme] = useState(() => {
    const storageValue = JSON.parse(storage.getItem('theme'));

    if (!storageValue) {
      return darkTheme;
    }

    if (storageValue.title === 'dark') {
      return darkTheme;
    }
    if (storageValue.title === 'light') {
      return lightTheme;
    }
  });

  useEffect(() => {
    const findStorage = typeof window !== 'undefined' ? window.localStorage : {};
    if (!findStorage.getItem('theme')) {
      findStorage.setItem('theme', JSON.stringify(darkTheme));
    }
   }, [theme]);

  const toggleTheme = () => {
    const storageValue = JSON.parse(storage.getItem('theme'));

    if (storageValue.title === 'dark') {
      storage ? storage.setItem('theme', JSON.stringify(lightTheme)) : null;
      setTheme(lightTheme);
    }
    if (storageValue.title === 'light') {
      storage ? storage.setItem('theme', JSON.stringify(darkTheme)) : null;
      setTheme(darkTheme);
    }
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

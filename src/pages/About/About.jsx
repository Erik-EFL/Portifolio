import { Container, Grid } from '@mui/material';
import React from 'react';
import useChangeLanguage from '../../Hooks/useChangeLanguage';
import Text from './components/Text/Text';
import Video from './components/Video/Video';

const text = {
  ptBR: 'Quem sou eu',
  enUS: 'Who am I',
}

const About = () => {
  const { language } = useChangeLanguage()

  return (
    <>
      <h1 style={{ textAlign: 'center', }}>{text[language]}</h1>
      <Container component='main' maxWidth='lg' sx={{
            margin: 'auto',
          }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={8} lg={6} sx={{
            margin: 'auto'
          }}>
            <Video />
          </Grid>
          <Grid item xs={12} sm={12} md={8} lg={6} sx={{
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <Text />
          </Grid>
        </Grid>
      </Container>
    </>
  )
};

export default About

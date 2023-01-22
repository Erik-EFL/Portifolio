import React from 'react';
import Container from '@mui/material/Container';
import Card from './components/Content/Card'; 'react';

const Projects = () => {
  return (
    <Container component='main'  maxWidth="lg" sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      marginTop: '90px',
    }}>
      <Card />
    </Container>
  );
}

export default Projects;

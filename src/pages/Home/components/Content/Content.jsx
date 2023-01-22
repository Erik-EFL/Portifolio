import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import useChangeLanguage from '../../../../Hooks/useChangeLanguage';

const Content = () => {
  const { data } = useChangeLanguage();

  const home = data?.home;

  if (!home) return null;

  return (
    <>
      <Grid sx={{
        margin: 'auto',
      }} item xs={12} sm={6} md={6} lg={6}>
        <Box sx={{ position: 'relative', marginBottom: '-10px'}}>
          <h3>
            <Typography component='span' sx={{
              position: 'relative',
              zIndex: '10',
              fontFamily: 'Montserrat',
              color: '#000000',
              backgroundColor: 'transparent',
              fontWeight: '800',
              fontSize: '1.2rem',
              lineHeight: '1.2rem',
              marginRight: '5px',
            }}>
              {home.circle}
            </Typography>
            {' '}
            {home.name}
          </h3>
          <Box sx={{
            position: 'absolute',
            top: '-16px',
            left: '-26px',
            width: '50px',
            height: '50px',
            borderRadius: '100%',
            backgroundColor: '#F1A208',
            marginLeft: '20px',
          }} />
        </Box>
        <TypeAnimation
          cursor
          sequence={[`${home.animation}`, 1000000]}
          wrapper="h1"
        />
        <Grid xs={12} sm={12} md={11} lg={11}  sx={{
          position: 'relative', marginTop: '-20px'
        }}>
          <Typography component='p'>
            {home.description.map((item, index) => {
              return (
                <span key={index}>
                  <br/>
                  {item}
                </span>
              );
            })}
            <Link
              className='homeLink'
              to="/about"
              aria-label='About me page'
              style={{
              color: '#F1A208',
              marginLeft: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}>
              {home.link}
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default Content;

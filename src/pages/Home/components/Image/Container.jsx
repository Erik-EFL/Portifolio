import React from 'react';
import { Box, Grid } from '@mui/material';
import erik from '../../../../Data/Image/perfil.webp';
import ImageContainer from './Container.style';
import LazyLoad from 'react-lazyload';
import useCheckRef from '../../../../Hooks/useCheckRef';

function Container() {
  const checkRef = useCheckRef('100%', '100%')

  return (
    <>
      <Grid component='section' xs={6} sm={5} md={5} lg={4}
        sx={{ margin: 'auto' }}
      >
        <Box
          component='div'
          >
          <LazyLoad height={200} once>
            <ImageContainer
              src={erik}
              component='img'
              alt="imagem de Erik lima"
              ref={checkRef}
              loading='lazy'
              width='100%'
              height='100%'
            />
          </LazyLoad>
        </Box>
      </Grid>
    </>
  );
}

export default Container;

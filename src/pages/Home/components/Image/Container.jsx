import React from 'react';
import { Box, Grid } from '@mui/material';
import erik from '../../../../Data/Image/perfil.webp';
import ImageContainer from './Container.style';
import Image from '../../../../components/ImageContainer/Image';

function Container() {
  return (
    <>
      <Grid component='section' xs={6} sm={5} md={5} lg={4}
        sx={{ margin: 'auto' }}
      >
        <Box component='div'>
          <Image
            src={erik}
            alt="imagem de Erik lima"
            w='100%'
            h='100%'
            style={{
              borderRadius: '50%',
              boxShadow:' 2px 2px 50px 0 rgba(0, 0, 0, 0.5)',
              marginTop: '20px',
            }}
          />
        </Box>
      </Grid>
    </>
  );
}

export default Container;

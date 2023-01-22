import { Container, Grid } from '@mui/material';
import React, { useMemo } from 'react';
import { CardStyled } from './Card.styled';
import data from '../../utils/Images'
import LazyLoad from 'react-lazyload';

function Card() {
  const projects = useMemo(() =>
  data?.map((item) => (
    <LazyLoad height={200} once>
      <CardStyled key={item.id}>
        <div className="card-title">
          <a href={item.url} target="_blank" title={item.title}><h3>{ item.title }</h3></a>
        </div>
        <div className='description'>
          <p>{ item.description }</p>
        </div>
        <div className="containerImage">
          <LazyLoad height={200} once>
            <img
              src={item.img}
              alt={`Project image: ${item.title}`}
              loading='lazy'
              />
          </LazyLoad>
        </div>
        <div className='tech'>
        {
          item.technologies.map((tech) => (
            <span>{tech}</span>
          ))
        }
        </div>
      </CardStyled>
    </LazyLoad>
  )) , [data]);

  return (
    <Container container component="main" sx={{
      maxWidth: '900px',
      marginTop: '-30px',
    }}>
      <Grid container spacing={2} xs={14} sm={14} md={14} lg={14} sx={{
        gap: '30px',
        justifyContent: 'center',
        position: 'relative',
        zIndex: '10',
        marginBottom: '120px',
      }}>
       { projects }
      </Grid>
    </Container>
  );
}

export default Card;

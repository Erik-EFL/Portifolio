import { SkillsSkeleton } from '@/components/Skeleton';
import { Box, Container, Grid, Rating } from '@mui/material';
import { CardStyled } from './Card.styled';
import { Skill, SkillCategory } from '../../../../@types/data-tipe.entity';
import { useLanguage } from '@/store/language.store';

const Card = () => {
  const { data, isLoading } = useLanguage()

  const { skillsDetails } = data

  if (isLoading) return <SkillsSkeleton />

  return (
    <Container component="main" sx={{
      maxWidth: '900px',
      marginTop: '-30px',
    }}>
      <Grid container spacing={2} xs={14} sm={12} md={12} lg={12} sx={{
        gap: '30px',
        justifyContent: 'center',
        position: 'relative',
        zIndex: '10',
      }}>
        <Box sx={{
          position: 'absolute',
          top: '-20px',
          left: '60px',
          width: '50px',
          height: '50px',
          borderRadius: '100%',
          backgroundColor: '#ffd001bd',
          marginLeft: '20px',
          zIndex: '-1',
        }} />
        {skillsDetails?.map((item: SkillCategory, index: number) => (
          <CardStyled key={index}>
            <Box sx={{
              position: 'absolute',
              bottom: '-10px',
              right: '90px',
              width: '50px',
              height: '50px',
              borderRadius: '100%',
              backgroundColor: '#ffd001bd',
              marginLeft: '20px',
              zIndex: '-1',
            }} />
            <div className="card-header">
              <h3>{ item.title }</h3>
              {
                item.title === 'Languages' || item.title === 'Others' || item.title === 'Soft Skills'
                ? <p></p>
                : <p>Skill Level</p>
              }
            </div>
              {item.skills.map((skill: Skill, index: number) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  alignContent: 'center',
                }}>
                  <h4>{ skill.name }</h4>
                  {
                    item.title === 'Languages' || item.title === 'Others' || item.title === 'Soft Skills'
                    ? <p>{ skill.level }</p>
                    : <Rating name="read-only" value={skill.level} readOnly sx={{
                      color: '#ffd001bd',
                      marginTop: '16px',
                    }} />
                    }
                  </div>
                ))}
          </CardStyled>
        ))}
        <Box sx={{
          position: 'absolute',
          bottom: '-10px',
          right: '90px',
          width: '50px',
          height: '50px',
          borderRadius: '100%',
          backgroundColor: '#ffd001bd',
          marginLeft: '20px',
          zIndex: '-1',
        }} />
      </Grid>
    </Container>
  );
}

export default Card;

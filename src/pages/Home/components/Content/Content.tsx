import { useLanguage } from '@/store/language.store'
import { Grid, Typography } from '@mui/material'
import { TypeAnimation } from 'react-type-animation'
import {
  AboutLink,
  BadgeDot,
  BadgeName,
  BadgeText,
  BadgeWrapper,
  RoleHeading
} from './Content.style'

const Content = () => {
  const { data, language, isLoading } = useLanguage()

  const { home } = data

  return (
    <Grid item xs={12} sm={6} md={6} lg={6} sx={{ margin: 'auto' }}>
      <BadgeWrapper>
        <BadgeName>
          <BadgeText>{home.circle}</BadgeText> {home.name}
        </BadgeName>
        <BadgeDot />
      </BadgeWrapper>
      {isLoading ? null : (
        <RoleHeading>
          <TypeAnimation
            key={`${language}-${home.title}`}
            cursor
            sequence={[`${home.title}`, 1000000]}
            wrapper='span'
          />
        </RoleHeading>
      )}
      <Grid
        item
        xs={12}
        sm={12}
        md={11}
        lg={11}
        sx={{ position: 'relative', marginTop: '-20px' }}
      >
        <Typography component='p'>
          {home.description.map((line: string, index: number) => (
            <span key={`${index}-${line}`}>
              <br />
              {line}
            </span>
          ))}
          <AboutLink to='/about'>{home.link}</AboutLink>
        </Typography>
      </Grid>
    </Grid>
  )
}

export default Content

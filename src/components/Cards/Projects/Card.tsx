import Button from '@mui/material/Button'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { ProjectCardStyled } from './Card.style'

interface ICardProps {
  name: string
  description: string
  gitHub: string
  site?: string
  id: string
  image: string
}

const ProjectCard = React.memo(function ProjectCard({
  name,
  description,
  gitHub,
  site,
  id,
  image
}: ICardProps) {
  return (
    <ProjectCardStyled id={id}>
      <CardMedia sx={{ height: 150 }} image={image} title={name} />
      <CardContent>
        <Typography gutterBottom variant='h5' component='div'>
          {name}
        </Typography>
        <Typography variant='body2'>{description}</Typography>
      </CardContent>
      <CardActions>
        <a href={gitHub} target='_blank' rel='noopener noreferrer'>
          <Button size='small'>Git Hub</Button>
        </a>
        {site ? (
          <a href={site} target='_blank' rel='noopener noreferrer'>
            <Button size='small'>Site</Button>
          </a>
        ) : null}
      </CardActions>
    </ProjectCardStyled>
  )
})

export default ProjectCard

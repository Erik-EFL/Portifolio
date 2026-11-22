import * as React from 'react'
import {
  ProjectAction,
  ProjectActions,
  ProjectBody,
  ProjectCardStyled,
  ProjectCover,
  ProjectDescription,
  ProjectTitle
} from './Card.style'

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
    <ProjectCardStyled id={id} aria-label={name}>
      <ProjectCover src={image} alt={`Prévia do projeto ${name}`} />
      <ProjectBody>
        <ProjectTitle>{name}</ProjectTitle>
        <ProjectDescription>{description}</ProjectDescription>
      </ProjectBody>
      <ProjectActions>
        <ProjectAction href={gitHub} target='_blank' rel='noopener noreferrer'>
          Git Hub
        </ProjectAction>
        {site ? (
          <ProjectAction href={site} target='_blank' rel='noopener noreferrer'>
            Site
          </ProjectAction>
        ) : null}
      </ProjectActions>
    </ProjectCardStyled>
  )
})

export default ProjectCard

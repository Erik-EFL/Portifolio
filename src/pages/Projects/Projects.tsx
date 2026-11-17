import { ProjectsSkeleton } from '@/components/Skeleton'
import Logo from '@/assets/Image/Logo.webp'
import ProjectCard from '../../components/Cards/Projects/Card'
import { ProjectsError, ProjectsStyled } from './Projects.style'
import Images from './utils/Images'
import useFetchProjects from './utils/useFetchProjects'

/** id do repositório -> screenshot local do projeto. */
const imageById = new Map(Images.map(item => [String(item.id), item.img]))

const Projects = () => {
  const { projects, isLoading, error, retry } = useFetchProjects()

  if (isLoading) return <ProjectsSkeleton />

  if (error) {
    return (
      <ProjectsError>
        <p role='alert'>Não foi possível carregar os projetos.</p>
        <button type='button' onClick={() => void retry()}>
          Tentar novamente
        </button>
      </ProjectsError>
    )
  }

  return (
    <ProjectsStyled>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          id={String(project.id)}
          name={project.name}
          description={project.description ?? ''}
          gitHub={project.html_url}
          site={project.homepage ?? undefined}
          image={imageById.get(String(project.id)) ?? Logo}
        />
      ))}
    </ProjectsStyled>
  )
}

export default Projects

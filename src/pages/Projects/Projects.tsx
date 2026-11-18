import { ProjectsSkeleton, SrOnly } from '@/components/Skeleton'
import { useLanguage } from '@/store/language.store'
import { usePageMeta, type LocalizedPageMeta } from '@/seo'
import Logo from '@/assets/Image/Logo.webp'
import ProjectCard from '../../components/Cards/Projects/Card'
import {
  ProjectsError,
  ProjectsNote,
  ProjectsSection,
  ProjectsStyled
} from './Projects.style'
import Images from './utils/Images'
import useFetchProjects from './utils/useFetchProjects'

/** id do repositório -> screenshot local do projeto. */
const imageById = new Map(Images.map(item => [String(item.id), item.img]))

const META: LocalizedPageMeta = {
  ptBR: {
    title: 'Projetos | Erik Ferreira Lima',
    description:
      'Projetos de Erik Ferreira Lima no GitHub: aplicações em React, React Native e Node.js, com código e demonstração.'
  },
  enUS: {
    title: 'Projects | Erik Ferreira Lima',
    description:
      "Erik Ferreira Lima's GitHub projects: React, React Native and Node.js applications with source code and live demos."
  }
}

const TITLE = {
  ptBR: 'Projetos',
  enUS: 'Projects'
}

const Projects = () => {
  const { language } = useLanguage()
  const { projects, isLoading, error, isStale, retry } = useFetchProjects()

  usePageMeta(META, '/projects')

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
    <ProjectsSection>
      <SrOnly as='h1'>{TITLE[language] ?? TITLE.ptBR}</SrOnly>
      {isStale && (
        <ProjectsNote role='status'>
          Mostrando a última lista salva — o GitHub não respondeu agora.
        </ProjectsNote>
      )}
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
    </ProjectsSection>
  )
}

export default Projects

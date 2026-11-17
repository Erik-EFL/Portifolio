import { ProjectsSkeleton } from '@/components/Skeleton'
import Logo from '@/assets/Image/Logo.webp'
import ProjectCard from '../../components/Cards/Projects/Card';
import { ProjectsStyled } from './Projects.style';
import useFetchProjects from './utils/FetchAPI';
import Images from './utils/Images';

const Projects = () => {
  const { filtered, isLoading, error } = useFetchProjects()

  if (isLoading) return <ProjectsSkeleton />
  if (error) return <p>Error</p>

  const filterData = filtered()

  if (!filterData) return <p>Error</p>

  const filterImages = filterData.map((project) => {
    const image = Images.filter((image) => {
      return String(image.id) === String(project.id)
    })

    return image.map((img) => {
      return {
        image: img.img,
      }
    })
  })

  const catOnlyImage = filterImages.map((image) => {
    if (image.length === 0 || image[0].image === undefined) {
      return Logo
    }
    return image[0].image
  })

  return (
    <ProjectsStyled>
      {filterData?.map((project) => (
        <ProjectCard
          key={project.id}
          name={project.name}
          description={project.description}
          gitHub={project.html_url}
          site={project?.home_page}
          id={project.id}
          image={catOnlyImage[filterData.indexOf(project)]}
        />
      ))}
    </ProjectsStyled>
  );
}

export default Projects;

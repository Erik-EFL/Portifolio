import React from 'react';
import ProjectCard from '../../components/Cards/Projects/Card';
import useFetchLanguages from './utils/FetchAPI';
import Images from './utils/Images';
import { ProjectsStyled } from './Projects.style';
// import requestGit from './utils/FetchUrl';

const Projects = () => {
  const { data, filtered, isLoading, error } = useFetchLanguages()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error</p>

  if(!data) return null;

  const filterData = filtered()
  const filterImages = filterData.map((project) => {
    const image = Images.filter((image) => {
      return image.id === project.id
    })

    return image.map((img) => {
      return {
        image: img.img,
      }
    })
  })

  const catOnlyImage = filterImages.map((image) => {
    if (image.length === 0 || image[0].image === undefined) {
      return 'src/Data/Image/Logo.webp'
    }
    return image[0].image
  })

  return (
    <ProjectsStyled>
      {filterData.map((project) => (
        <ProjectCard
          key={project.id}
          name={project.name}
          description={project.description}
          gitHub={project.html_url}
          site={project.homepage}
          id={project.id}
          image={catOnlyImage[filterData.indexOf(project)]}
        />
      ))}
    </ProjectsStyled>
  );
}

export default Projects;

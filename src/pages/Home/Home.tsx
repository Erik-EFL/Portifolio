import { HomeContentSkeleton, HomeImageSkeleton } from '@/components/Skeleton'
import { useLanguage } from '@/store/language.store'
import { usePageMeta, type LocalizedPageMeta } from '@/seo'
import Content from './components/Content/Content'
import ContainerImage from './components/Image/Container'
import HomeContainer from './Home.style'

const META: LocalizedPageMeta = {
  ptBR: {
    title: 'Erik Ferreira Lima | Desenvolvedor Full Stack JavaScript',
    description:
      'Portfólio de Erik Ferreira Lima, desenvolvedor full stack JavaScript: React, React Native, Node.js e TypeScript, projetos e contato.'
  },
  enUS: {
    title: 'Erik Ferreira Lima | Full Stack JavaScript Developer',
    description:
      "Erik Ferreira Lima's portfolio, full stack JavaScript developer: React, React Native, Node.js and TypeScript, projects and contact."
  }
}

const Home = () => {
  const { isLoading } = useLanguage()

  usePageMeta(META, '/')

  return (
    <HomeContainer>
      <section>
        {isLoading ? (
          <>
            <HomeContentSkeleton />
            <HomeImageSkeleton />
          </>
        ) : (
          <>
            <Content />
            <ContainerImage />
          </>
        )}
      </section>
    </HomeContainer>
  )
}

export default Home

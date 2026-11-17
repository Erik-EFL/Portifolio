import { HomeContentSkeleton, HomeImageSkeleton } from '@/components/Skeleton'
import { useLanguage } from '@/store/language.store'
import Content from './components/Content/Content';
import ContainerImage from './components/Image/Container';
import HomeContainer from './Home.style';
'react';

const Home = () => {
  const { isLoading } = useLanguage()

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
  );
};

export default Home;

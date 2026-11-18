import Container from '@mui/material/Container'
import { SrOnly } from '@/components/Skeleton'
import { useLanguage } from '@/store/language.store'
import { usePageMeta, type LocalizedPageMeta } from '@/seo'
import Card from './Components/Content/Card'

const META: LocalizedPageMeta = {
  ptBR: {
    title: 'Habilidades | Erik Ferreira Lima',
    description:
      'Habilidades de Erik Ferreira Lima: front-end com React e React Native, back-end com Node.js, bancos de dados, ferramentas e idiomas.'
  },
  enUS: {
    title: 'Skills | Erik Ferreira Lima',
    description:
      'Erik Ferreira Lima skills: front-end with React and React Native, back-end with Node.js, databases, tooling and languages.'
  }
}

const TITLE = {
  ptBR: 'Habilidades',
  enUS: 'Skills'
}

const Skills = () => {
  const { language } = useLanguage()

  usePageMeta(META, '/skills')

  return (
    <Container
      component='main'
      maxWidth='lg'
      sx={{
        marginTop: '90px',
        marginBottom: '120px'
      }}
    >
      {/* A página não tem título visível (o desenho são os cards), mas o h1
          precisa existir: sem ele a hierarquia começava nos h3 das categorias. */}
      <SrOnly as='h1'>{TITLE[language] ?? TITLE.ptBR}</SrOnly>
      <Card />
    </Container>
  )
}

export default Skills

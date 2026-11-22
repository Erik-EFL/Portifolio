import { useLanguage } from '@/store/language.store'
import { TypeAnimation } from 'react-type-animation'
import {
  AboutLink,
  BadgeDot,
  BadgeName,
  BadgeText,
  BadgeWrapper,
  HeroColumn,
  HeroParagraph,
  HeroTextBlock,
  RoleHeading
} from './Content.style'

const Content = () => {
  const { data, language, isLoading } = useLanguage()

  const { home } = data

  return (
    <HeroColumn>
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
      <HeroTextBlock>
        <HeroParagraph>
          {home.description.map((line: string, index: number) => (
            <span key={`${index}-${line}`}>
              <br />
              {line}
            </span>
          ))}
          <AboutLink to='/about'>{home.link}</AboutLink>
        </HeroParagraph>
      </HeroTextBlock>
    </HeroColumn>
  )
}

export default Content

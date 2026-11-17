/* eslint-disable */
import {
  AboutContent,
  HomeContent,
  IData,
  NavigationLink,
  Skill,
  SkillCategory,
  FooterItem,
  LocalizedSection
} from './data-tipe.entity'

declare const home: LocalizedSection<HomeContent>[]
declare const about: LocalizedSection<AboutContent>[]
declare const footer: LocalizedSection<NavigationLink>[]
declare const footerCopyright: LocalizedSection<FooterItem>[]
declare const navigation: LocalizedSection<NavigationLink>[]
declare const skills: LocalizedSection<SkillCategory>[]
declare const skillsDetails: LocalizedSection<SkillCategory>[]
export default {
  navigation,
  footer,
  footerCopyright,
  home,
  about,
  skills,
  skillsDetails
}

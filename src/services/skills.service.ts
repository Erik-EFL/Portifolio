import dataArray from '@/constant/Data/data.json'
import { SkillCategory, TLanguage } from '@/@types/data-tipe.entity'

export const getSkills = (language: TLanguage): SkillCategory[] => {
  const section = dataArray.skills.find(
    ({ language: sectionLanguage }) => sectionLanguage === language
  )

  return section?.items ?? []
}

export const getSkillsDetails = (language: TLanguage): SkillCategory[] => {
  const section = dataArray.skillsDetails.find(
    ({ language: sectionLanguage }) => sectionLanguage === language
  )

  return section?.items ?? []
}

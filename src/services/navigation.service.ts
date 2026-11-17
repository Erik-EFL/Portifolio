import dataArray from '@/constant/Data/data.json'
import { NavigationLink, TLanguage } from '@/@types/data-tipe.entity'

export const getNavigation = (language: TLanguage): NavigationLink[] => {
  const section = dataArray.navigation.find(
    ({ language: sectionLanguage }) => sectionLanguage === language
  )

  return section?.items ?? []
}

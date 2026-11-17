import dataArray from '@/constant/Data/data.json'
import { HomeContent, TLanguage } from '@/@types/data-tipe.entity'

export const getHome = (language: TLanguage): HomeContent => {
  const section = dataArray.home.find(
    ({ language: sectionLanguage }) => sectionLanguage === language
  )

  return section?.items[0] ?? ({} as HomeContent)
}
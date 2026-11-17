import dataArray from '@/constant/Data/data.json'
import {
  FooterItem,
  NavigationLink,
  TLanguage
} from '@/@types/data-tipe.entity'

export const getFooter = (language: TLanguage): NavigationLink[] => {
  const section = dataArray.footer.find(
    ({ language: sectionLanguage }) => sectionLanguage === language
  )

  return section?.items ?? []
}

export const getFooterCopyright = (language: TLanguage): FooterItem[] => {
  const section = dataArray.footerCopyright.find(
    ({ language: sectionLanguage }) => sectionLanguage === language
  )

  return section?.items ?? []
}

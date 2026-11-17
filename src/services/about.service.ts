import AboutData from '@/constant/Data/About.data'
import { TLanguage } from '@/@types/data-tipe.entity'

export const getAbout = (language: TLanguage): string[] => AboutData[language]
import type { TLanguage } from '@/@types/portfolio.entity'

const calculateAge = (birthDate: string): number => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    throw new Error(
      'Invalid date format. Please provide date in YYYY-MM-DD format.'
    )
  }

  const today = new Date()
  const birthDateDate = new Date(birthDate)

  if (birthDateDate > today) {
    throw new Error('Invalid birth date provided')
  }

  let age = today.getFullYear() - birthDateDate.getFullYear()
  const month = today.getMonth() - birthDateDate.getMonth()

  if (month < 0 || (month === 0 && today.getDate() < birthDateDate.getDate())) {
    age -= 1
  }

  return age
}

function getPeriodOfDay(): string {
  let currentHour: number
  try {
    currentHour = new Date().getHours()
  } catch (error) {
    console.error(error)
    currentHour = 0
  }
  const period: Period = getPeriodByHour(currentHour)
  const language = getLanguage()
  return translatePeriod(period, language)
}

type Period = 'morning' | 'afternoon' | 'night' | 'late night'

function getPeriodByHour(currentHour: number): Period {
  switch (true) {
    case currentHour >= 6 && currentHour < 12:
      return 'morning'
    case currentHour >= 12 && currentHour < 18:
      return 'afternoon'
    case currentHour >= 18 && currentHour < 0:
      return 'night'
    default:
      return 'late night'
  }
}

function getLanguage(): TLanguage {
  try {
    if (typeof localStorage !== 'undefined') {
      const storedLanguage: string | null = localStorage.getItem('language')
      if (storedLanguage === 'ptBR' || storedLanguage === 'enUS') {
        return storedLanguage
      }
    }

    const browserLanguage =
      typeof navigator === 'undefined' ? '' : navigator.language.toLowerCase()
    if (browserLanguage.startsWith('pt')) return 'ptBR'
    if (browserLanguage.startsWith('en')) return 'enUS'
  } catch (e) {
    console.error(e)
  }

  return 'ptBR'
}

function translatePeriod(period: Period, language: TLanguage): string {
  const translations: Record<TLanguage, Record<Period, string>> = {
    enUS: {
      morning: 'good morning',
      afternoon: 'good afternoon',
      night: 'good night',
      'late night': 'good night'
    },
    ptBR: {
      morning: 'bom dia',
      afternoon: 'boa tarde',
      night: 'boa noite',
      'late night': 'boa madrugada'
    }
  }

  return translations[language][period]
}

export default {
  ptBR: [
    `Oi ${getPeriodOfDay()}! Como ja dito no nosso contato inicial eu sou o Erik, tenho ${calculateAge(
      '1995-04-11'
    )} anos.`,
    'Desenvolvedor Web Full Stack que mora em Guarulhos, SP. ',
    'Uma das minhas paixões é o código e outras incluem, treinar na academia, meus gatos e peixes, escutar música, assistir animações e séries, ter ideias e minha familia.',
    'Eu procuro sempre estar praticando o que ja sei e sempre aberto a aprender coisas novas.',
    `Eu almejo ser o melhor programador possível, para poder transformar a vida de pessoas através da tecnologia.`
  ],
  enUS: [
    `Hi ${getPeriodOfDay()}! I'm Erik, I'm ${calculateAge(
      '1995-04-11'
    )} years old.`,
    'Full Stack Web Developer living in Guarulhos, SP. ',
    'One of my passions is coding and others include, training in the gym, my pets and fish, listening to music, watching animations and TV series, having ideas and my family.',
    'I seek always to practice what I know and always open to learn new things.',
    `I'm looking forward to be the best programmer I can be, to be able to transform people's lives using technology.`
  ]
}

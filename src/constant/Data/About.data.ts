import type { TLanguage } from '@/@types/portfolio.entity'

/**
 * Texto de fallback do "Sobre mim" (quando a API não responde).
 *
 * A saudação e a idade NÃO ficam gravadas aqui: os placeholders abaixo são
 * resolvidos no render por `resolveAboutScripts` (services/about-script.service).
 * Antes o texto era montado no import do módulo, o que congelava a saudação no
 * horário em que o bundle carregou.
 */
const ABOUT: Record<TLanguage, string[]> = {
  ptBR: [
    'Oi, o script vai aqui! Como ja dito no nosso contato inicial eu sou o Erik, tenho o script da idade vai aqui anos.',
    'Desenvolvedor Web Full Stack que mora em Guarulhos, SP. ',
    'Uma das minhas paixões é o código e outras incluem, treinar na academia, meus gatos e peixes, escutar música, assistir animações e séries, ter ideias e minha familia.',
    'Eu procuro sempre estar praticando o que ja sei e sempre aberto a aprender coisas novas.',
    'Eu almejo ser o melhor programador possível, para poder transformar a vida de pessoas através da tecnologia.'
  ],
  enUS: [
    "Hi, o script vai aqui! I'm Erik, I'm o script da idade vai aqui years old.",
    'Full Stack Web Developer living in Guarulhos, SP. ',
    'One of my passions is coding and others include, training in the gym, my pets and fish, listening to music, watching animations and TV series, having ideas and my family.',
    'I seek always to practice what I know and always open to learn new things.',
    "I'm looking forward to be the best programmer I can be, to be able to transform people's lives using technology."
  ]
}

export default ABOUT

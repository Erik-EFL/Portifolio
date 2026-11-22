import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/store/language.store'
import { resolveAboutScripts } from '@/services/about-script.service'
import TextArea from './Text-Area.styled'

/** Reavalia a saudação a cada minuto: sem isso, "bom dia" fica na tela até a noite. */
const SCRIPT_REFRESH_MS = 60_000

const Text = () => {
  const { data, language } = useLanguage()

  const { about } = data

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), SCRIPT_REFRESH_MS)
    return () => clearInterval(interval)
  }, [])

  // Placeholders ("o script vai aqui") viram saudação/idade no momento do
  // render — o conteúdo gravado no admin nunca carrega a idade.
  const paragraphs = useMemo(
    () => resolveAboutScripts(about, { language, now }),
    [about, language, now]
  )

  return (
    <TextArea className='textAbout' role='region' aria-label='Texto sobre mim'>
      {paragraphs.map((item: string, index: number) => {
        return <p key={index}>{item}</p>
      })}
    </TextArea>
  )
}

export default Text

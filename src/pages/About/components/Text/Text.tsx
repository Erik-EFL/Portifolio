import { useLanguage } from '@/store/language.store'
import TextArea from './Text-Area.styled'

const Text = () => {
  const { data } = useLanguage()

  const { about } = data

  return (
    <TextArea className='textAbout'>
      {about.map((item: string, index: number) => {
        return (
          <p key={index}>
            {item}
          </p>
        )
      })}
    </TextArea>
  )
}

export default Text
import { useLanguage } from '@/store/language.store'
import { ToggleContainer } from './toggle.styled'
import { useCountryInfo } from 'use-country-info'
import { Input } from '@/components/Input/Input'
import Image from '@/components/ImageContainer/Image'

export default function CustomizedSwitches() {
  const { language, changeLanguage } = useLanguage()
  const { countryflags } = useCountryInfo()

  const isChecked = language === 'enUS'

  const brFlag = countryflags.find(({ name }) => name?.common === 'Brazil')
  const usFlag = countryflags.find(
    ({ name }) => name?.common === 'United States'
  )

  const handleChange = () => {
    changeLanguage(isChecked ? 'ptBR' : 'enUS')
  }

  return (
    <ToggleContainer className='toggleTheme'>
      <Image
        src={brFlag?.flags?.svg}
        loading='lazy'
        w='30'
        h='30'
        alt='imagem de bandeira do brasil'
      />
      <Input
        type={'checkbox'}
        classNew='check'
        name={'language'}
        ariaLabel={'pt-BR / en-US'}
        checked={isChecked}
        onChange={handleChange}
      />
      <Image
        src={usFlag?.flags?.svg}
        loading='lazy'
        w='30'
        h='30'
        alt='imagem de bandeira dos estados unidos'
      />
    </ToggleContainer>
  )
}

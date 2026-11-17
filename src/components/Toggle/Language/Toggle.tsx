import { useLanguage } from '@/store/language.store'
import usePersistedState from '../../../Hooks/usePersistedState'
import { ToggleContainer } from './toggle.styled'
import { useCountryInfo } from 'use-country-info'
import { Input } from '@/components/Input/Input'
import Image from '@/components/ImageContainer/Image';

export default function CustomizedSwitches() {
  const [isChecked, setIsChecked] = usePersistedState('input', false)
  const { changeLanguage } = useLanguage()
  const { countryflags } = useCountryInfo()

  const brFlag = countryflags.filter(({ name }) => name?.common === 'Brazil')[0]
  const usFlag = countryflags.filter(
    ({ name }) => name?.common === 'United States'
  )[0]

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked)
    changeLanguage(isChecked ? 'ptBR' : 'enUS')
    window.location.reload()
  }

  return (
    <ToggleContainer className='toggleTheme'>
      <Image src={brFlag?.flags?.svg} loading='lazy' w="30" h="30" alt="imagem de bandeira do brasil" />
      <Input
        type={'checkbox'}
        classNew='check'
        name={'language'}
        ariaLabel={'language'}
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

import { Input } from '@/components/Input/Input'
import { useTheme } from '@/context/theme.context'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ToggleStyled } from './toggle.styles'

interface IToggleThemeProps {
  number: number
  toggleTheme?: () => void
}

function ToggleTheme({ number, toggleTheme }: IToggleThemeProps) {
  const { themeMode, switchTheme } = useTheme()

  const handleChange = toggleTheme ?? switchTheme

  return (
    <ToggleStyled className='checkTheme'>
      <Input
        type={'checkbox'}
        id={`change-Theme-color-${number}`}
        classNew='check-box-change-Theme-color'
        name={'check-box-change-Theme-color'}
        onChange={handleChange}
        checked={themeMode === 'dark'}
        ariaLabel={'check-box-change-Theme-color'}
      />
      {/* sem aria-label aqui: em <label> o nome acessível vem do conteúdo
          (o input ao lado é quem carrega o rótulo) */}
      <label className='label' htmlFor={`change-Theme-color-${number}`}>
        <FontAwesomeIcon className='fa-moon' icon={faMoon} />
        <FontAwesomeIcon className='fa-sun' icon={faSun} />
        <div className='ball' />
      </label>
    </ToggleStyled>
  )
}

export default ToggleTheme

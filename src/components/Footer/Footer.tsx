import { useLanguage } from '@/store/language.store'
import CustomizedSwitches from '../Toggle/Language/Toggle'
import ToggleTheme from '../Toggle/Theme/Toggle.theme'
import { FooterContainer } from './Footer.style'

interface IFooterProps {
  toggleTheme: () => void
}

export default function Footer({ toggleTheme }: IFooterProps) {
  const { data } = useLanguage()

  const copyright = data.footerCopyright[0]?.copyright

  return (
    <FooterContainer>
      <div className='container-footer'>
        <p>{copyright}</p>
        <CustomizedSwitches />
        <ToggleTheme toggleTheme={toggleTheme} number={2} />
      </div>
    </FooterContainer>
  )
}

import { useLanguage } from '@/store/language.store'
import PropTypes from 'prop-types'
import CustomizedSwitches from '../Toggle/Language/Toggle'
import ToggleTheme from '../Toggle/Theme/Toggle.theme'
import { FooterContainer } from './Footer.style'

export default function Footer({ toggleTheme }) {
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

Footer.propTypes = {
  toggleTheme: PropTypes.func
}

import SocialIcons from '../Icons/Icons_social'
import ToggleTheme from '../Toggle/Theme/Toggle.theme'
import Logo from './Components/logo/Logo'
import Nav from './Components/nav/Nav'
import HeaderStyled from './Header.style'

interface IHeaderProps {
  toggleTheme: () => void
}

function Header({ toggleTheme }: IHeaderProps) {

  return (
    <HeaderStyled>
      <div className="header-internal">
        <Logo />
        <Nav />
        <SocialIcons />
        <ToggleTheme toggleTheme={toggleTheme} number={1} />
      </div>
    </HeaderStyled>
  )
}

export default Header

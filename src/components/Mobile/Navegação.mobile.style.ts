import styled from 'styled-components'

/**
 * Barra de navegação fixa do mobile. O fundo/cor vêm dos tokens (antes vinham
 * das classes `.bottonMenu`/`.mobileLinks` do Global.style.js, que não existe
 * mais). Só aparece no breakpoint em que o menu do header é escondido.
 */
const NavMenu = styled.nav`
  position: fixed;
  z-index: 900;
  bottom: 0;
  left: 0;
  width: 100%;
  display: none;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 0.35rem 0 0.25rem;
  background-color: ${({ theme }) => theme.semantic.surfaceElevated};
  border-top: 1px solid ${({ theme }) => theme.semantic.border};

  .mobileLinks {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
    text-decoration: none;
    color: ${({ theme }) => theme.semantic.textMuted};
    font-size: 0.7rem;
    transition: color 0.2s linear, opacity 0.2s linear;

    .mobileIcon {
      display: inline-flex;
      font-size: 1.35rem;
      line-height: 1;
    }

    &:hover {
      color: ${({ theme }) => theme.semantic.text};
    }
  }

  .mobileLinks.active {
    color: ${({ theme }) => theme.semantic.text};
  }

  @media (max-width: 640.2px) {
    display: flex;
  }
`

export default NavMenu

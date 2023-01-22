import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

  * {
    box-sizing: border-box;
  }

  /* Estilo geral */
  body {
    background: ${({ theme }) => theme.background.primary} !important;
    color: ${({ theme }) => theme.colors.primary} !important;
    font-family: 'Segoe UI', Montserrat, sans-serif;
    ::-webkit-scrollbar {
      width: 0.1rem;
    }
  }

  /* Ícones */
  .icon {
    color: ${({ theme }) => theme.colors.primary};
    outline: 2px solid ${({ theme }) => theme.colors.primary};
  }

  /* Texto */
  .textAbout
  {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 500;
    font-size: 1.2rem;
  }

  /* Navegação mobile */
  .bottonMenu {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.background.primary};
    transition: all 0.25s linear;
  }

  /* Links mobile */
  .mobileLinks,
  .mobileLinks.active {
    color: ${({ theme }) => theme.colors.primary};
    transition: all 0.25s linear;
  }

  /* Link home */
  .homeLink {
    color: ${({ theme }) => theme.colors.secondary};
  }

  /* Navegação ativa */
  .menu,
  .is-open,
  .active {
    opacity: 1;
    color: ${({ theme }) => theme.colors.secondary};
    transition: all 0.25s linear;
  }

  /* Navegação inativa */
  .is-closed,
  .inactive {
    opacity: 0.6;
    color: ${({ theme }) => theme.colors.primary};

    &:hover {
      opacity: 1;
    }
  }

  /* Rodapé */
  footer {
    color: ${({ theme }) => theme.colors.primary};
    transition: all 0.25s linear;
  }

`;

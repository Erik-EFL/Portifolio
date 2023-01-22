import Styled from "styled-components";

export const FooterContainer = Styled.footer`
  /* Posicionamento */
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 12;

  /* Layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  /* Espaçamento */
  padding: 0.8rem;
  letter-spacing: 0.1rem;

  /* Estilo */
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.colors.primary};

  /* Estilo específico para o elemento p */
  p{
    margin-left: 100px;
  }


  /* Media queries */
  @media (max-width: 640.2px) {
    display: none;
  }

  @media (min-width:  935.1px) {
    .checkTheme {
      display: none;
    }
  }

  @media (min-width: 640.3px) and (max-width: 935px) {
    .checkTheme {
      display: flex;
    }
  }
`;

import Styled from 'styled-components'

export const FooterContainer = Styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;

  z-index: 12;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  gap: 1rem;

  padding: 0.8rem;

  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? theme.colors.grayscale[20]
      : theme.colors.grayscale[100]};
  color: ${({ theme }) =>
    theme.mode === 'dark'
      ? theme.colors.grayscale[100]
      : theme.colors.grayscale[10]};
  transition: background-color 0.25s linear, color 0.25s linear;

  p {
    letter-spacing: 0.1rem;
  }

  .container-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;
    width: 100%;
    max-width: 900px;
  }

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
`

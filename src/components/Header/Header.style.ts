import styled from 'styled-components'

const HeaderStyled = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  height: 100px;
  width: 100%;
  z-index: 1000;
  background: ${({ theme }) => theme.semantic.surfaceElevated};
  transition: background-color 0.25s linear;
  padding: 0 50px;

  .header-internal {
    display: flex;
    margin: 0 auto;
    max-width: 1200px;
  }

  @media (min-width: 640.3px) and (max-width: 935px) {
    .checkTheme {
      display: none;
    }
  }

  @media (min-width: 640.3px) and (max-width: 840px) {
    .icon-social-media {
      display: none;
    }

    .menuContacts {
      .icon-social-media {
        display: flex;
      }
    }
  }

  @media (min-width: 320px) and (max-width: 640.2px) {
    width: 100%;

    .icon-social-media {
      display: flex;
    }

    .checkTheme {
      display: none;
    }
  }
`

export default HeaderStyled

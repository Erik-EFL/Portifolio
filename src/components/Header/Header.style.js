import styled from 'styled-components';

const HeaderStyled = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  height: 100px;
  margin: 0 auto;
  max-width: 1200px;

  @media (min-width: 769px) {
    width: 90%;
  }

  @media (min-width: 640.3px) and (max-width: 935px) {
    .checkTheme {
      display: none;
    }
  }

  @media (min-width: 640.3px) and (max-width: 840px)  {
    .icon-social-media {
      display: none;
    }

    .menuContacts {
      .icon-social-media {
        display: flex;
      }
    }
  }

  @media (min-width: 320px) and (max-width: 640.2px)  {
    width: 100%;

    .icon-social-media {
      display: flex;
    }

    .checkTheme {
      display: none;
    }
  }
`;

export default HeaderStyled;

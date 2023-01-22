import styled from 'styled-components';

const NavMenu = styled.nav`
//configuração do menu base
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 10px;
  width: 65vw;

  @media (min-width: 840px) and (max-width: 1080px) {
    .completeMenu {
      margin-right: 50px;
    }
  }
`;

const Container = styled.div`
 //configuração do menu base
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 20px;
  padding: 0 10px;
  font-size: 18px;
  font-weight: 700;


  .active {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: none;
    transition: all 0.5s ease-in-out;
    font-size: 20px;
  }

  .inactive {
    text-decoration: none;
    transition: all 0.5s ease-in-out;
    font-size: 20px;

    &:hover {
      text-decoration: none;
      transition: all 0.5s ease-in-out;
    }
  }

  // break points
  @media (min-width: 838px) {
    .menuContacts {
      display: none;
    }
  }

  @media (min-width: 640.2px) and (max-width: 840px) {
     .menuContacts {
      display: flex;
    }
  }

  @media (min-width: 320px) and (max-width: 640.2px) {
    .active {
      display: none;
    }
    .inactive {
      display: none;
    }

    .menuContacts {
      display: none;

      .link {
        display: none;
      }
      .menu {
        display: none;
      }
    }
  }
`;

export {
  NavMenu,
  Container,
};

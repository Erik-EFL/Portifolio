import styled from 'styled-components';

const Container = styled.nav`
  /* Layout */
  position: relative;
  display: flex;
  align-items: center;

  /* Estilo do botão do menu */
  .menu {
    font-size: 20px;
    font-weight: 700;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  /* Estilo dos contatos */
  .contacts {
    opacity: 0;
    display: none;
    position: absolute;
    margin-top: 100px;
    right: -10px;
    padding: 0;
    transition: all 0.5s ease-in-out;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
  }

  /* Estilo dos contatos aberto */
  .is-open {
    opacity: 1;
    display: flex;
  }

  /* Estilo do icone social mobile */
  .icon-social-mobile {
    display: none;
  }
`;

export default Container;

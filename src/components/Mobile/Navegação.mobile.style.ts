import styled from 'styled-components';

const NavMenu = styled.nav`
  position: fixed;
  z-index: 10;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 0;


  .mobileLinks {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-content: center;
    text-decoration: none;
    line-height: 0;
    margin-top: 0;
    margin-bottom: 15px;
    opacity: 0.4;
    transition: all 0.5s ease-in-out;


    h1 {
      margin-bottom: -10px;
      padding: 0;
      display: inline-block;
     }
  }

  a:hover {
    opacity: 1;
  }

  .mobileLinks.active {
    opacity: 1;
    transition: all 0.5s ease-in-out;
  }
`;

export default NavMenu;

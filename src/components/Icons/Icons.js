import styled from 'styled-components';

const IconsMenu = styled.div`
  position: relative;
  width: 100px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 0 25px;
  margin-right: 56px;
  align-items: center;
  justify-content: center;
  align-content: center;
  grid-gap: 15px;

  .icon {
    margin-top: -15px;
    font-size: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    transition-property: outline-offset, outline-color, background-color;
    transition-duration: 0.25s;
    opacity: 1;
  }

  .icon:hover {
    outline-offset: 4px;
  }

  .icon:hover i{
    animation: shake .25s;
  }

  .ri-instagram-line:hover {
    background-image: radial-gradient(
      circle at 30% 107%,
      #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%
    );
    outline-color: #a02d76;
  }

  .ri-linkedin-fill:hover {
    background-color: #0077b5;
    outline-color: #0077b5;
  }

  .ri-github-line:hover {
    background-color: #000;
    outline-color: #000;
  }

  .icons {
    text-decoration: none;
  }
`;

export default IconsMenu;


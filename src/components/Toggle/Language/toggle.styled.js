import styled from "styled-components";

export const ToggleContainer = styled.label`
  /* Layout */
  position: relative;
  display: flex;
  flex-direction: row;
  width: 250px;

  /* Estilo do toggle */
  .check {
    position: relative;
    width: 50px;
    margin-left: 10px;
    margin-right: 20px;

    &:before {
      content: '';
      position: absolute;
      width: 60px;
      height: 25px;
      background: linear-gradient(90deg, hsla(97, 100%, 40%, 1) 0%, hsla(66, 100%, 96%, 1) 100%);
      border-radius: 50px;
      transition: transform 0.2s linear;
      box-sizing: border-box;
    }

    &:checked:before {
      background: linear-gradient(90deg, hsla(98, 100%, 95%, 1) 0%, hsla(219, 61%, 75%, 1) 51%, hsla(227, 100%, 45%, 1) 100%);
      transition: transform 0.2s linear;
    }

    &:after {
      content: '';
      position: absolute;
      width: 25px;
      height: 25px;
      background: #fff;
      border: 2px solid linear-gradient(90deg, hsla(97, 100%, 40%, 1) 0%, hsla(66, 100%, 96%, 1) 100%);
      border-radius: 25px;
      transition: transform 0.2s linear;
      box-sizing: border-box;
    }

    &:checked:after {
      left: 35px;
      border: 2px solid linear-gradient(90deg, hsla(98, 100%, 95%, 1) 0%, hsla(219, 61%, 75%, 1) 51%, hsla(227, 100%, 45%, 1) 100%);
      transition: transform 0.2s linear;
    }
  }

  /* Estilo do input firefox */
  input[type="checkbox"] {
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    cursor: pointer;
  }

  /* Esconder em telas menores */
  @media (min-width: 320px) and (max-width: 603px)  {
    display: none;
  }
`;

import styled from 'styled-components'

export const ToggleStyled = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .check-box-change-Theme-color {
    opacity: 0;
    position: absolute;
  }

  .label {
    width: 50px;
    height: 26px;
    background-color: #111;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
    border-radius: 50px;
    transform: scale(1.5);
    cursor: pointer;
    position: relative;
  }

  .ball {
    width: 20px;
    height: 20px;
    background-color: white;
    position: absolute;
    top: 3px;
    left: 3px;
    border-radius: 50%;
    transition: transform 0.2s linear;
  }

  /* target the element after the label*/
  .check-box-change-Theme-color:checked + .label .ball {
    transform: translateX(24px);
  }

  .fa-moon {
    color: #f6f4f3;
  }

  .fa-sun {
    color: yellow;
  }
`

import styled from "styled-components";

const sx = (props) => {
  return `${props}`;
}

export const StyledInput = styled.input`
  ${props => sx(props.sx)}
`;

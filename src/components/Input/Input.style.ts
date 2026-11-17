import styled from "styled-components";

const sx = (props: any) => {
  return `${props}`;
}

interface StyledInputProps {
  sx?: any
}

export const StyledInput = styled.input<StyledInputProps>`
  ${props => sx(props.sx)}
`;

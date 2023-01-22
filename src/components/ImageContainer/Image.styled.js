import styled from "styled-components";

const sx = (props) => {
  return `${props}`;
}

export const ImageStyle = styled.img`
  ${props => sx(props.sx)}
  object-fit: "contain"
`;

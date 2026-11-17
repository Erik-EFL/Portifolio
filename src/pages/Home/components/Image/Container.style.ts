import { Box } from '@mui/system';
import styled from 'styled-components';

const ImageContainer = styled.image`
  width: 500px;
  height: 500px;

  border-radius: 50%;
  box-shadow: 2px 2px 50px 0 rgba(0, 0, 0, 0.5);

  margin-top: 20px;

  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  image {
    width: 100%;
    height: 100%;
  }
`;

export default ImageContainer;

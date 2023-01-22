import { Grid } from '@mui/material';
import styled from 'styled-components';

export const CardStyled = styled(Grid)`
  width: 330px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #a0a0a0;
  display: inline-block;
  box-shadow: 0 8px 32px 0 rgba( 0, 0, 0, 0.37 );
  justify-content: center;
  align-items: center;
  align-content: center;

  a {
    color: #ffffffcb;
  }

  .card-title {
    width: 100%;
    margin-bottom: 15px;

    h3 {
      background: transparent;
      margin: 0;
      padding: 0;
    }
  }

  .description {
    width: 100%;
    height: 24%;
    margin-bottom: 15px;
  }

  .containerImage {
    width: 280px;
    height: 150px;
    img {
      width: 100%;
      height: 100%;
      border: 1px solid #a0a0a0;
      border-radius: 20px;
    }
  }

  .tech {
    width: 100%;
    height: 5%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 8px;
    row-gap: 5px;
    line-height: 15px;
    padding: 0;
    margin-top: 15px;
    margin-bottom: 40px;

    span {
      background: ${({ theme }) => theme.background.primary};
      color: ${({ theme }) => theme.colors.primary};
      padding: 6px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
    }
  }
`;

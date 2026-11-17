import { Card } from '@mui/material';
import styled from 'styled-components';
import type { DefaultTheme } from 'styled-components';

/**
 * Cores do card vindas dos tokens do site.
 *
 * `grayscale` é a mesma escala nos dois temas, então cada superfície/texto
 * precisa escolher a ponta oposta conforme `theme.mode`; a cor de destaque sai
 * dos módulos (goldenPalette), que já são diferentes por tema.
 */
const surface = (theme: DefaultTheme) =>
  theme.mode === 'dark' ? theme.colors.grayscale[20] : theme.colors.grayscale[100];

const surfaceBorder = (theme: DefaultTheme) =>
  theme.mode === 'dark' ? theme.colors.grayscale[40] : theme.colors.grayscale[90];

const titleColor = (theme: DefaultTheme) =>
  theme.mode === 'dark' ? theme.colors.grayscale[110] : theme.colors.grayscale[10];

const descriptionColor = (theme: DefaultTheme) =>
  theme.mode === 'dark' ? theme.colors.grayscale[70] : theme.colors.grayscale[40];

const accentColor = (theme: DefaultTheme) =>
  theme.mode === 'dark'
    ? theme.colors.modules[1].color[2][60]
    : theme.colors.modules[1].color[2][30];

export const ProjectCardStyled = styled(Card)`
  && {
    width: 300px;
    height: 300px;
    border-radius: 10px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    backdrop-filter: blur(4px);
    background-color: ${({ theme }) => surface(theme)};
    border: 1px solid ${({ theme }) => surfaceBorder(theme)};
  }

  && .MuiTypography-h5 {
    color: ${({ theme }) => titleColor(theme)};
  }

  && .MuiTypography-body2 {
    color: ${({ theme }) => descriptionColor(theme)};
  }

  && .MuiButton-root {
    color: ${({ theme }) => accentColor(theme)};
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  && .MuiButton-root:hover {
    background-color: ${({ theme }) => `${accentColor(theme)}1f`};
  }
`;

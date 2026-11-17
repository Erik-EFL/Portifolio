import { createGlobalStyle } from 'styled-components'

/**
 * Estilos globais que aplicam os tokens de tema ao documento.
 *
 * `grayscale` é a mesma escala nos dois temas, então o fundo/texto da página
 * precisa escolher a ponta oposta conforme `theme.mode` — sem isso o
 * ThemeProvider troca o objeto mas nada muda na tela.
 */
export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: ${({ theme }) => (theme.mode === 'dark' ? 'dark' : 'light')};
  }

  body {
    background-color: ${({ theme }) =>
      theme.mode === 'dark'
        ? theme.colors.grayscale[10]
        : theme.colors.grayscale[110]} !important;
    color: ${({ theme }) =>
      theme.mode === 'dark'
        ? theme.colors.grayscale[110]
        : theme.colors.grayscale[10]} !important;
  }
`

import { createGlobalStyle } from 'styled-components'

/**
 * Estilos globais que aplicam os tokens de tema ao documento.
 *
 * `grayscale` é a mesma escala nos dois temas, então o fundo/texto da página
 * precisa escolher a ponta oposta conforme `theme.mode` — sem isso o
 * ThemeProvider troca o objeto mas nada muda na tela.
 *
 * O reset abaixo substitui o `<CssBaseline />` do MUI, que era o último
 * componente do pacote ainda montado no topo da árvore. Os valores são os
 * mesmos que ele aplicava (tipografia `body1` = Roboto 1rem/1.5, letter-spacing
 * 0.00938em, `box-sizing: inherit`, `strong` em 700): copiados de propósito,
 * porque trocar a fonte base mudaria a página inteira.
 */
export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: ${({ theme }) => (theme.mode === 'dark' ? 'dark' : 'light')};
  }

  html {
    box-sizing: border-box;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  body {
    margin: 0;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938em;
    background-color: ${({ theme }) => theme.semantic.surface} !important;
    color: ${({ theme }) => theme.semantic.text} !important;
  }

  body::backdrop {
    background-color: ${({ theme }) => theme.semantic.surface};
  }

  strong,
  b {
    font-weight: 700;
  }
`

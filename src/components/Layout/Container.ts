import styled, { css } from 'styled-components'

/**
 * Larguras nomeadas herdadas do `maxWidth` do Container do MUI: cada uma só
 * aplica a partir do próprio breakpoint (abaixo dele o container é fluido, com
 * 100% de largura). Não é uma escada de larguras — é uma única regra por
 * breakpoint, igual ao componente original.
 */
export type ContainerWidth = 'sm' | 'md' | 'lg'

const WIDTHS: Record<ContainerWidth, { breakpoint: string; max: string }> = {
  sm: { breakpoint: '37.5rem', max: '600px' },
  md: { breakpoint: '56.25rem', max: '900px' },
  lg: { breakpoint: '75rem', max: '1200px' }
}

/**
 * Moldura de página (substitui `<Container>` do MUI). O elemento padrão é
 * `main`; use a prop `as` para virar `div` quando o `main` da página já existe
 * — dois landmarks `main` aninhados são inválidos.
 */
export const Container = styled.main<{ $maxWidth?: ContainerWidth }>`
  display: block;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  padding-left: 1rem;
  padding-right: 1rem;

  @media (min-width: 37.5rem) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  ${({ $maxWidth = 'lg' }) => {
    const { breakpoint, max } = WIDTHS[$maxWidth]

    return css`
      @media (min-width: ${breakpoint}) {
        max-width: ${max};
      }
    `
  }}
`

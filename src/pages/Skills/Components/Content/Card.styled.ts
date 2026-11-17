import { Grid, Rating } from '@mui/material'
import styled from 'styled-components'

/**
 * Círculo decorativo da marca. É cor de identidade (não superfície de tema),
 * por isso fica fixa em vez de sair de `theme.semantic`.
 */
const DECORATION = '#ffd001bd'

export const CardStyled = styled(Grid)`
  position: relative;
  z-index: 1;
  width: 280px;
  padding: 20px;
  line-height: 15px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.semantic.border};
  display: inline-block;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  backdrop-filter: blur(10px);
  background-color: ${({ theme }) => theme.semantic.surfaceElevated};

  h4 {
    margin-bottom: 0;
    padding: 0;
  }

  p {
    padding: 0;
    margin-left: -10px;
  }
`

export const CardHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.semantic.border};
  display: flex;
  justify-content: space-between;
  margin-top: -12px;
  padding: 0;
  width: 100%;
`

export const SkillRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

/** Camada decorativa atrás dos cards (posições sorteadas no componente). */
export const DecorationsLayer = styled.div`
  position: absolute;
  inset: -28px 0;
  z-index: 0;
  /* corta o que passa nas laterais (sem criar scroll horizontal) e deixa as
     bolinhas de topo/base aparecerem porque a camada é mais alta que o grid */
  overflow: hidden;
  pointer-events: none;
`

interface IDotProps {
  $top: string
  $left: string
  $size: number
}

export const Dot = styled.span<IDotProps>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 100%;
  background-color: ${DECORATION};
`

export const SkillRating = styled(Rating)`
  && {
    color: ${DECORATION};
    margin-top: 16px;
  }
`

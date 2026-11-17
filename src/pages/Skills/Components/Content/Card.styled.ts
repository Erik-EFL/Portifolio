import { Grid, Rating } from '@mui/material'
import styled from 'styled-components'

/**
 * Círculo decorativo da marca. É cor de identidade (não superfície de tema),
 * por isso fica fixa em vez de sair de `theme.semantic`.
 */
const DECORATION = '#ffd001bd'

export const CardStyled = styled(Grid)`
  width: 280px;
  padding: 20px;
  line-height: 15px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.semantic.border};
  display: inline-block;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  backdrop-filter: blur(10px);
  background: transparent;

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

interface IDecorationProps {
  $top?: string
  $bottom?: string
  $left?: string
  $right?: string
}

/** Um único círculo decorativo, posicionado por props (eram 3 `Box` copiados). */
export const Decoration = styled.div<IDecorationProps>`
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 100%;
  background-color: ${DECORATION};
  margin-left: 20px;
  z-index: -1;
  ${({ $top }) => $top && `top: ${$top};`}
  ${({ $bottom }) => $bottom && `bottom: ${$bottom};`}
  ${({ $left }) => $left && `left: ${$left};`}
  ${({ $right }) => $right && `right: ${$right};`}
`

export const SkillRating = styled(Rating)`
  && {
    color: ${DECORATION};
    margin-top: 16px;
  }
`

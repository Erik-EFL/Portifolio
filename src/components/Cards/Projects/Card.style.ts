import { Card } from '@mui/material'
import styled from 'styled-components'

/**
 * As cores do card vêm dos tokens semânticos do tema (`theme.semantic`),
 * inclusive as do MUI, que de outro modo usam a paleta light fixa
 * (`text.primary`, `#1976d2`).
 */
export const ProjectCardStyled = styled(Card)`
  && {
    width: 300px;
    height: 300px;
    border-radius: 10px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    backdrop-filter: blur(4px);
    background-color: ${({ theme }) => theme.semantic.surfaceElevated};
    border: 1px solid ${({ theme }) => theme.semantic.border};
  }

  && .MuiTypography-h5 {
    color: ${({ theme }) => theme.semantic.text};
  }

  && .MuiTypography-body2 {
    color: ${({ theme }) => theme.semantic.textMuted};
  }

  && .MuiButton-root {
    color: ${({ theme }) => theme.semantic.accent};
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  && .MuiButton-root:hover {
    background-color: ${({ theme }) => `${theme.semantic.accent}1f`};
  }
`

import styled from 'styled-components'
import { Link } from 'react-router-dom'

/**
 * Hero da Home. Cores vindas dos tokens (incluindo `onAccent`, escuro nos dois
 * temas, para o texto do badge laranja) — sem `sx` com hex fixo.
 */

/** Cor de identidade do site (badge e link de destaque). */
const BRAND = '#F1A208'

export const BadgeWrapper = styled.div`
  position: relative;
  margin-bottom: -10px;
`

export const BadgeText = styled.span`
  position: relative;
  z-index: 10;
  font-family: Montserrat, sans-serif;
  color: ${({ theme }) => theme.semantic.onAccent};
  background-color: transparent;
  font-weight: 800;
  font-size: 1.2rem;
  line-height: 1.2rem;
  margin-right: 5px;
`

export const BadgeDot = styled.span`
  position: absolute;
  top: -10px;
  left: -27px;
  width: 40px;
  height: 40px;
  border-radius: 100%;
  background-color: ${BRAND};
  margin-left: 20px;
  z-index: -1;
`

export const AboutLink = styled(Link)`
  color: ${BRAND};
  margin-left: 5px;
  font-weight: bold;
  cursor: pointer;
`

import { Rating } from '@mui/material'
import styled from 'styled-components'
import type { DefaultTheme } from 'styled-components'

/**
 * Círculo decorativo da marca. É cor de identidade (não superfície de tema),
 * por isso fica fixa em vez de sair de `theme.semantic`.
 */
const DECORATION = '#ffd001bd'

/**
 * Material "liquid glass": filme translúcido com gradiente, blur + saturação do
 * que está atrás (as bolinhas aparecem desfocadas por baixo), borda de luz e
 * brilho especular na aresta de cima.
 */
const glass = (theme: DefaultTheme) =>
  theme.mode === 'dark'
    ? {
        film: 'linear-gradient(140deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.06) 48%, rgba(255, 255, 255, 0.02) 100%)',
        border: 'rgba(255, 255, 255, 0.22)',
        specular: 'rgba(255, 255, 255, 0.45)',
        glow: 'rgba(255, 255, 255, 0.12)',
        shadow: '0 18px 50px rgba(0, 0, 0, 0.45)'
      }
    : {
        film: 'linear-gradient(140deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.6) 48%, rgba(255, 255, 255, 0.42) 100%)',
        border: 'rgba(255, 255, 255, 0.9)',
        specular: 'rgba(255, 255, 255, 0.95)',
        glow: 'rgba(255, 255, 255, 0.55)',
        shadow: '0 18px 50px rgba(16, 16, 18, 0.18)'
      }

/** Lista vertical: um card embaixo do outro. */
export const SkillsList = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`

export const CardStyled = styled.section`
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 1.5rem 1.75rem;
  border-radius: 28px;
  overflow: hidden;
  background: ${({ theme }) => glass(theme).film};
  border: 1px solid ${({ theme }) => glass(theme).border};
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  box-shadow: ${({ theme }) => glass(theme).shadow},
    inset 0 1px 0 ${({ theme }) => glass(theme).specular},
    inset 0 -1px 0 rgba(255, 255, 255, 0.06);

  /* brilho especular na aresta superior */
  &::before {
    content: '';
    position: absolute;
    inset: 0 14% auto;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${({ theme }) => glass(theme).specular},
      transparent
    );
    pointer-events: none;
  }

  /* realce suave no canto superior esquerdo */
  &::after {
    content: '';
    position: absolute;
    inset: -40% auto auto -10%;
    width: 60%;
    height: 90%;
    background: radial-gradient(
      closest-side,
      ${({ theme }) => glass(theme).glow},
      transparent
    );
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  h3 {
    margin: 0;
    padding: 0;
    font-weight: 600;
  }

  p {
    margin: 0;
    padding: 0;
  }
`

export const CardHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => glass(theme).border};

  /* o título da categoria é um h2 no markup; 1.5rem mantém o tamanho que os
     estilos padrão do navegador já pintavam (24px) */
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  p {
    color: ${({ theme }) => theme.semantic.textMuted};
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`

/**
 * Skills em colunas de no máximo 5 itens: `grid-auto-flow: column` com 5 linhas
 * fixas cria quantas colunas forem necessárias (14 skills = 5 + 5 + 4).
 */
export const SkillsGrid = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(5, auto);
  grid-auto-columns: minmax(0, 1fr);
  column-gap: 2rem;
  row-gap: 0.45rem;

  @media (max-width: 640.2px) {
    /* no mobile colunas de 5 não cabem: vira lista única */
    grid-auto-flow: row;
    grid-template-rows: none;
    grid-template-columns: 1fr;
  }
`

export const SkillRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;

  h3 {
    /* nome pode ser longo ("Styled Components") e a coluna fica estreita:
       quebrar em duas linhas em vez de vazar por cima da coluna vizinha */
    min-width: 0;
    font-size: 1rem;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }
`

/** Camada decorativa atrás dos cards (posições sorteadas no componente). */
export const DecorationsLayer = styled.div`
  position: absolute;
  inset: -28px 0;
  z-index: 0;
  /* corta o que passa nas laterais (sem criar scroll horizontal) e deixa as
     bolinhas de topo/base aparecerem porque a camada é mais alta que a lista */
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
    flex-shrink: 0;
    color: ${DECORATION};
  }
`

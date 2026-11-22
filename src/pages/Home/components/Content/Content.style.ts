import styled from 'styled-components'
import { Link } from 'react-router-dom'

/**
 * Hero da Home. Cores vindas dos tokens (incluindo `onAccent`, escuro nos dois
 * temas, para o texto do badge laranja) — sem `sx` com hex fixo.
 */

/**
 * Coluna do hero. Era `<Grid item xs={12} sm={6} md={6} lg={6} sx={{margin:'auto'}}>`:
 * largura total no mobile e metade da linha a partir de 600px (breakpoint `sm`
 * do MUI), centralizada pelo `margin: auto`.
 */
export const HeroColumn = styled.div`
  width: 100%;
  margin: auto;

  @media (min-width: 37.5rem) {
    flex: 0 1 50%;
    max-width: 50%;
  }
`

/**
 * Bloco de texto do hero. Era outro `<Grid item xs={12} md={11}>` com margem
 * negativa para colar o parágrafo no cargo.
 */
export const HeroTextBlock = styled.div`
  position: relative;
  margin-top: -20px;

  @media (min-width: 56.25rem) {
    max-width: 91.6667%;
  }
`

/** Parágrafo do hero: `Typography component='p'`, sem a margem padrão de `<p>`. */
export const HeroParagraph = styled.p`
  margin: 0;
`

/** Cor de identidade do site (badge e link de destaque). */
const BRAND = '#F1A208'

export const BadgeWrapper = styled.div`
  /* inline-block ancora a bolinha no texto: como bloco de largura total ela
     escapava para a esquerda quando o hero passou a ser centralizado */
  position: relative;
  display: inline-block;
  margin-bottom: -10px;
`

/**
 * O nome é o h1 da página (é o que identifica a pessoa para o buscador). O
 * reset abaixo faz o heading renderizar igual ao `<span>` inline que existia
 * aqui: mesma fonte, mesmo tamanho, sem margem de bloco.
 */
export const BadgeName = styled.h1`
  display: inline;
  margin: 0;
  font: inherit;
  color: inherit;
`

/**
 * O cargo era um `<h1>` e herdava do navegador 2em/negrito/margem 0.67em.
 * Agora é `h2` (hierarquia: nome -> cargo) e os números são repetidos aqui para
 * o visual continuar idêntico ao default.
 */
export const RoleHeading = styled.h2`
  font-size: 2em;
  margin: 0.67em 0;
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
  width: 45px;
  height: 42px;
  border-radius: 100%;
  background-color: ${BRAND};
  margin-left: 20px;
  z-index: -1;
`

export const AboutLink = styled(Link)`
  /* #F1A208 sobre o fundo claro dá contraste 2:1 (ilegível); o token accent é
     o mesmo ouro na versão acessível de cada tema. */
  color: ${({ theme }) => theme.semantic.accent};
  margin-left: 5px;
  font-weight: bold;
  cursor: pointer;
`

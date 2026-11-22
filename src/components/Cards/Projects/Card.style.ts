import styled from 'styled-components'

/**
 * Card do projeto. Era `<Card>` do MUI com overrides de `&& .MuiTypography-*`
 * e `&& .MuiButton-root`; agora cada pedaço tem seu componente, então as cores
 * saem direto dos tokens sem depender de classe gerada pelo MUI.
 */
export const ProjectCardStyled = styled.article`
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 300px;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  backdrop-filter: blur(4px);
  background-color: ${({ theme }) => theme.semantic.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.semantic.border};
`

/** Capa: 150px de altura, igual ao `<CardMedia sx={{ height: 150 }}>`. */
export const ProjectCover = styled.img`
  display: block;
  width: 100%;
  height: 150px;
  object-fit: cover;
  background-size: cover;
  background-position: center;
`

export const ProjectBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  padding: 1rem;
`

/** Título: era `Typography variant='h5' gutterBottom` pintado por classe MUI. */
export const ProjectTitle = styled.h2`
  margin: 0 0 0.35em;
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.334;
  color: ${({ theme }) => theme.semantic.text};
`

/** Descrição: era `Typography variant='body2'`. */
export const ProjectDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.43;
  color: ${({ theme }) => theme.semantic.textMuted};
`

export const ProjectActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
`

/**
 * Ação do card. Era `<a><Button size='small'>...</Button></a>` — um botão
 * dentro de um link (HTML inválido, foco duplicado); agora o próprio link é o
 * botão, com navegação e teclado nativos.
 */
export const ProjectAction = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.75;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  color: ${({ theme }) => theme.semantic.accentStrong};

  &:hover {
    background-color: ${({ theme }) => `${theme.semantic.accent}1f`};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.semantic.accent};
    outline-offset: 2px;
  }
`

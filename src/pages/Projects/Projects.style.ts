import styled from 'styled-components'

export const ProjectsStyled = styled.main`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  height: 76vh;
  max-width: 1200px;
  margin: 0 auto;
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
  // scroll personalizado para o container
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.semantic.scrollbar.track};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.semantic.scrollbar.thumb};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.semantic.scrollbar.thumbHover};
  }
`

export const ProjectsError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 76vh;
  padding: 1rem;
  text-align: center;

  button {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.semantic.border};
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
`

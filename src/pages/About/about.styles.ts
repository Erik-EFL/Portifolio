import styled from 'styled-components'

export const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: auto;
  padding-bottom: 7rem;
`

export const Title = styled.h1`
  margin: 0;
  font: inherit;
  text-align: center;
`

export const TextColumn = styled.div`
  width: 100%;
  max-width: 900px;
  margin-inline: auto;
`

export const ResumeNav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-block: 1.5rem;
`

export const ResumeButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.semantic.border};
  background: transparent;
  color: ${({ theme }) => theme.semantic.accentStrong};
  font: inherit;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => `${theme.semantic.accent}1f`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.semantic.accent};
    outline-offset: 2px;
  }
`

export const PageMessage = styled.p`
  margin: 0;
  text-align: center;
`

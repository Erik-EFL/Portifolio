import styled from 'styled-components';

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
    background: ${({ theme }) =>
      theme.mode === 'dark' ? theme.colors.grayscale[20] : theme.colors.grayscale[100]};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? theme.colors.grayscale[80] : theme.colors.grayscale[60]};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? theme.colors.grayscale[90] : theme.colors.grayscale[40]};
  }
`;

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
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

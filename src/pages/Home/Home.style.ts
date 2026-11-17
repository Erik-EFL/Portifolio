import styled from 'styled-components'

const HomeContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100vh - 150px);
  max-width: 1300px;
  flex: 1;

  margin: auto;

  & section {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
  }

  @media (min-width: 399.3px) and (max-width: 768px) {
    margin-top: 20px;
  }

  @media (min-width: 768.1px) and (max-width: 1024px) {
    margin-top: 20px;
  }

  @media (min-width: 1024.1px) {
    margin-top: 30px;
  }
`

export default HomeContainer

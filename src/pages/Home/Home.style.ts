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

  /* No mobile o hero não cabia lado a lado: a foto de 500px era empurrada para
     fora da tela (x=251, right=644 em viewport de 393), o que esticava o
     documento e quebrava até o position:fixed da barra inferior. */
  @media (max-width: 900px) {
    height: auto;
    min-height: calc(100vh - 150px);
    padding: 24px 16px 120px;

    & section {
      flex-direction: column-reverse;
      align-items: center;
      justify-content: center;
      gap: 28px;
      text-align: center;
    }
  }
`

export default HomeContainer

import styled from 'styled-components'

/**
 * Texto do "Sobre mim".
 *
 * O bloco tinha altura fixa de viewport (55vh / 50vh / 23vh) e `overflow-y:
 * scroll` porque dividia a tela com o vídeo. Com o vídeo fora, o recorte virou
 * defeito: no mobile a caixa de 23vh mantinha a altura do bloco e o texto
 * transbordava por cima dos botões de currículo; no desktop o
 * `margin-bottom: 100px` abria um vão até os botões. Agora o texto flui e o
 * espaçamento entre os blocos é o `gap` da `Main`.
 */
const TextArea = styled.article`
  width: 100%;
  padding: 0 20px;
  font-size: 1rem;
  line-height: 1.2;
  text-align: left;
  text-justify: distribute-all-lines;
`

export default TextArea

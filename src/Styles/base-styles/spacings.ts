import { css } from 'styled-components'

export const spacings = {
  titles: css`
    padding: 0 100px;
  `,
  articleHeader: css`
    padding: 0 145px;

    @media (max-width: 600px) {
      padding: 20px;
    }
  `,
  articleBody: css`
    padding: 0 170px;

    @media (max-width: 600px) {
      padding: 0 20px;
    }
  `
}

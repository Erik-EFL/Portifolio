import { RuleSet } from 'styled-components'

export enum TypographyStyles {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  BtnEM = 'btnEM',
  Normal = 'normal',
  Subtitle = 'subtitle',
  Font = 'font',
  Credit = 'credit',
  Btn = 'btn',
  Card = 'card'
}

export type TypographyType = {
  [key in TypographyStyles]: RuleSet<object>
}

import ITheme from '@/@types/design-system/ITheme'

import { breakpoints, respondTo } from './base-styles/breakpoints'
import { grayscale, module, semanticTokens } from './base-styles/colors'
import { spacings } from './base-styles/spacings'
import { typographyStyle } from './base-styles/typography'

export class LightTheme implements ITheme {
  constructor(
    colors: Partial<ITheme['colors']> = {},
    typography: Partial<ITheme['typography']> = {},
    breakpoints: Partial<ITheme['breakpoints']> = {}
  ) {
    this.colors = Object.assign(this.colors, colors)
    this.typography = Object.assign(this.typography, typography)
    this.breakpoints = Object.assign(this.breakpoints, breakpoints)

    Object.freeze(this)
  }

  mode = 'light'

  colors = {
    grayscale,
    modules: module['light']
  }

  /** Papel de cada cor neste tema — ver base-styles/colors.ts. */
  semantic = semanticTokens.light

  spacing = spacings

  typography = typographyStyle

  breakpoints = breakpoints
  respondTo = respondTo
}

export const theme = new LightTheme()

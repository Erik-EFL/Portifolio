import { RuleSet } from 'styled-components'

import { BreakpointsSizes, BreakpointsType } from './breakpoints'
import { ColorPaletteInterface } from './colors'
import { TypographyType } from './typography'

interface ITheme {
  colors: ColorPaletteInterface
  typography: TypographyType
  breakpoints: BreakpointsType
  respondTo(
    breakpoints: BreakpointsSizes | BreakpointsSizes[],
    style: RuleSet<object>
  ): RuleSet<object>
}

export default ITheme

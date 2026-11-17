import { BreakpointsSizes, BreakpointsType } from 'design-system/break-point'
import {
  GrayscaleInterface,
  ColorsInterface,
  ThemeChangeInterface,
  ColorPaletteInterface
} from 'design-system/colors'
import { Modules } from 'design-system/modules'
import { TypographyStyles, TypographyType } from 'design-system/typography'
import { RuleSet } from 'styled-components'

declare module 'design-system' {
  export {
    BreakpointsSizes,
    BreakpointsType,
    GrayscaleInterface,
    ColorsInterface,
    ThemeChangeInterface,
    ColorPaletteInterface,
    RuleSet,
    TypographyStyles,
    TypographyType,
    Modules
  }
}

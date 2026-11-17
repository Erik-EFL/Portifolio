import { Modules } from './modules'

export interface GrayscaleInterface {
  10: string
  20: string
  30: string
  40: string
  50: string
  60: string
  70: string
  80: string
  90: string
  100: string
  110: string
}

export interface ColorsInterface {
  10: string
  20: string
  30: string
  40: string
  50: string
  60: string
  70: string
  80: string
  90: string
  100: string
  110: string
}

export interface ThemeChangeInterface {
  color: {
    [variant: string]: ColorsInterface
  }
}

export interface ColorPaletteInterface {
  grayscale: GrayscaleInterface
  modules: Record<Modules, ThemeChangeInterface>
}

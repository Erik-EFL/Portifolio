import 'styled-components'

import { type LightTheme } from '@/Styles/light-theme'

declare module 'styled-components' {
  // Module augmentation precisa de interface; o corpo vazio é o idioma correto aqui.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends LightTheme {}
}

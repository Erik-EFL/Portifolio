import "styled-components";

import { type LightTheme } from "@/Styles/light-theme";

declare module "styled-components" {
  export interface DefaultTheme extends LightTheme {}
}

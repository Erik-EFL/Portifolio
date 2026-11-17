import { BreakpointsSizes } from '@/@types/design-system/breakpoints'
import { RuleSet, css } from 'styled-components'

export const breakpoints = {
  mobile: '24.375rem',
  tablet: '52.125rem',
  laptop: '90rem'
}

export function respondTo(
  breakpoint: BreakpointsSizes | BreakpointsSizes[],
  style: RuleSet<object>
): RuleSet<object> {
  const { mobile, tablet, laptop } = breakpoints

  const queryMap: Record<BreakpointsSizes, string> = {
    mobile: `(max-width: ${mobile})`,
    tablet: `(min-width: calc(${mobile} + 1px)) and (max-width: ${tablet})`,
    laptop: `(min-width: calc(${tablet} + 1px)) and (max-width: ${laptop})`
  }

  const generateCss = (breakpoints: BreakpointsSizes): RuleSet<object> => {
    const mediaQuery = queryMap[breakpoints]
    return mediaQuery
      ? css`
          @media ${mediaQuery} {
            ${style}
          }
        `
      : css`
          ${style}
        `
  }

  if (Array.isArray(breakpoint)) return breakpoint.map(generateCss)

  return generateCss(breakpoint)
}

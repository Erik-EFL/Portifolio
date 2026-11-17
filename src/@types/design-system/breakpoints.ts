export enum BreakpointsSizes {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Laptop = 'laptop'
}

export type BreakpointsType = {
  [key in BreakpointsSizes]: string
}

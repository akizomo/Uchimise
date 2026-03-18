export const spacing = {
  xxs: 2,   // icon label gap / inline micro spacing
  xs:  4,   // icon inner padding
  sm:  8,   // tag / chip gap
  md:  12,  // card inner padding
  lg:  16,  // section gap
  xl:  20,  // screen edge padding
  xxl: 28,  // large section gap
} as const;

export type SpacingToken = keyof typeof spacing;

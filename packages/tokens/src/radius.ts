export const radius = {
  sm:   10,  // inline badge / small elements
  md:   14,  // card (standard)
  lg:   16,  // card (large)
  pill: 999, // tag / button / chip
} as const;

export type RadiusToken = keyof typeof radius;

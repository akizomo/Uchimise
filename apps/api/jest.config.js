/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  // forceExit prevents BullMQ/ioredis from holding the process open after tests
  forceExit: true,
  moduleNameMapper: {
    '^@uchimise/tokens$': '<rootDir>/../../packages/tokens/src/index.ts',
  },
};

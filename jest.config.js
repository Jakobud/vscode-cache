/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm', // Use ts-jest with ESM
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'], // Treat .ts files as ESM
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }], // ts-jest config goes here
  },
  moduleFileExtensions: ['ts', 'js', 'mjs'],
  testMatch: ['**/test/**/*.test.ts'], // Adjust this to match your test file structure
};

export default {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  globals: {
    jest: true
  },
  injectGlobals: true
};
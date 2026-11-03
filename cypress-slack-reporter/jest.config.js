module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts']
};

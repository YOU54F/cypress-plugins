module.exports = {
  testRegex: '.*.test.ts',
  moduleFileExtensions: [
    'js',
    'ts',
  ],
  transform: {
    '\\.ts': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
    '^.+.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  testEnvironment: 'node',
  reporters: [
    'default',
    'jest-junit',
    'jest-stare',
  ],
  coverageDirectory: './coverage',
  collectCoverage: true,
  setupFiles: [
    './src/slack/test/setup-tests.ts',
  ],
}
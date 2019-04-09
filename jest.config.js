module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  testRegex: "scripts/slack/.*.test.ts",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "\\.ts": "ts-jest"
  },
  testEnvironment: "node",
  reporters: ["default", "jest-junit"],
  coverageDirectory: "./coverage",
  collectCoverage: true
};
module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  testRegex: "src/slack/test/.*.test.ts",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "\\.ts": "ts-jest"
  },
  testEnvironment: "node",
  reporters: ["default", "jest-junit", "jest-stare"],
  coverageDirectory: "./coverage",
  collectCoverage: true,
  setupFiles: ["./src/slack/test/setup-tests.ts"]
};

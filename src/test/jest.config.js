module.exports = {
  roots: [
    "<rootDir>"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  testMatch: ["**/test/**/*.spec.unit.[jt]s"],
  globals: {
    "ts-jest": {
      diagnostics: false,
    }
  },
  globalSetup: "./setup.ts"
};

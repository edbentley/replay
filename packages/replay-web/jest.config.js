module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  globalSetup: "<rootDir>/jest-global-setup",
  globalTeardown: "<rootDir>/jest-global-teardown",
  testEnvironmentOptions: { resources: "usable" }, // allow images to be loaded
  testURL: "http://localhost:3020",
};

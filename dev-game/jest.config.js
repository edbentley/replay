module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  globals: { ASSET_NAMES: {} },
  testTimeout: 30000,
};

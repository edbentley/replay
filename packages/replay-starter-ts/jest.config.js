module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transformIgnorePatterns: ["/node_modules/(?!@replay/).+\\.js$"],
  globals: { ASSET_NAMES: {} },
  testTimeout: 30000,
};

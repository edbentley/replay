module.exports = {
  transformIgnorePatterns: ["/node_modules/(?!@replay/).+\\.js$"],
  globals: { ASSET_NAMES: {} },
  testTimeout: 30000,
};

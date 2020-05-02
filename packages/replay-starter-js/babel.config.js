const presets = [
  [
    "@babel/env",
    {
      targets: {
        edge: "17",
        firefox: "60",
        chrome: "49",
        safari: "11.1",
      },
      useBuiltIns: "usage",
      corejs: 3,
    },
  ],
];

module.exports = { presets };

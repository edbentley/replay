const path = require("path");

module.exports = {
  entry: "./src/core.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader?configFile=tsconfig.json",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "replay-core.js",
    path: path.resolve(__dirname, "../replay-swift/Replay"),
    library: "replay",
  },
};

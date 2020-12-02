const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "swift/dev-game"),
    library: "game",
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    // Ensure import of web from swift is also local package
    alias: {
      "@replay/web": path.resolve(__dirname, "../packages/replay-web/src"),
    },
    extensions: [".wasm", ".mjs", ".js", ".json", ".ts"],
  },
};

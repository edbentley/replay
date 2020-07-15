const path = require("path");

module.exports = {
  entry: "./src/__tests__/game.ts",
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
    path: path.resolve(__dirname, "ReplayTextInput/Tests/ReplayTextInputTests"),
    library: "game",
  },
};
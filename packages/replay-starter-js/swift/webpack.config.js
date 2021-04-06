const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      PLATFORM: JSON.stringify("ios"),
    }),
  ],
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "."),
    library: "game",
  },
};

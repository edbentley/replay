const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
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
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: "assets/images" }, { from: "assets/audio" }],
    }),
    new webpack.DefinePlugin({
      PLATFORM: JSON.stringify("android"),
    }),
  ],
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "app/src/main/assets"),
    library: "game",
  },
};

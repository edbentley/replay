const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: "./web/index.js",
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
      PLATFORM: JSON.stringify("web"),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
  ],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  performance: {
    hints: false,
  },
  devServer: {
    host: "0.0.0.0",
    // Codesandbox support
    disableHostCheck: true,
  },
};

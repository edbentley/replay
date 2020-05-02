const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./web/index.ts",
  mode: "development",
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
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: "assets/images" },
      { from: "assets/audio" },
    ]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "web/index.html"),
    }),
    new webpack.DefinePlugin({
      ASSET_NAMES: JSON.stringify(getAssetNames()),
    }),
  ],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    host: "0.0.0.0",
  },
};

function getAssetNames() {
  const imageFileNames = fs.readdirSync(
    path.resolve(__dirname, "assets/images")
  );
  const audioFileNames = fs.readdirSync(
    path.resolve(__dirname, "assets/audio")
  );

  return {
    imageFileNames,
    audioFileNames,
  };
}

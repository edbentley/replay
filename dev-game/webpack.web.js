const path = require("path");
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
  ],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  // Test on local network
  // devServer: {
  //   host: "0.0.0.0",
  // },
  resolve: {
    // Ensure import of core from web is also local package
    alias: {
      "@replay/core/dist": path.resolve(
        __dirname,
        "../packages/replay-core/src"
      ),
    },
    extensions: [".wasm", ".mjs", ".js", ".json", ".ts"],
  },
};

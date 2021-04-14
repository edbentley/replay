const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: { transpileOnly: true },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      PLATFORM: JSON.stringify("ios"),
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "."),
    library: "game",
  },
};

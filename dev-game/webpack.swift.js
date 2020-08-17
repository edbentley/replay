const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

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
  plugins: [
    new webpack.DefinePlugin({
      ASSET_NAMES: JSON.stringify(getAssetNames()),
    }),
  ],
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

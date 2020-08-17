const fs = require("fs");
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
      ASSET_NAMES: JSON.stringify(getAssetNames()),
    }),
  ],
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "."),
    library: "game",
  },
};

function getAssetNames() {
  const imageFileNames = fs.readdirSync(
    path.resolve(__dirname, "../assets/images")
  );
  const audioFileNames = fs.readdirSync(
    path.resolve(__dirname, "../assets/audio")
  );

  return {
    imageFileNames,
    audioFileNames,
  };
}

const path = require("path");

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
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "."),
    library: "game",
  },
};

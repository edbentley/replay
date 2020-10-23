const path = require("path");

module.exports = {
  entry: "./src/renderCanvas.ts",
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
    filename: "renderCanvas.js",
    path: path.resolve(__dirname, "./Replay/Sources/Replay/Resources"),
    library: "renderCanvas",
  },
};

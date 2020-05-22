const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Webpack = require("webpack");
const autoprefixer = require("autoprefixer");

module.exports = ["source-map"].map((devtool) => ({
  mode: "production",
  entry: "./src/scripts/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "minibox.min.js",
    library: "Minibox",
    libraryTarget: "umd",
    libraryExport: "default",
    umdNamedDefine: true,
  },
  devtool,
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new Webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    new Webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
      filename: "minibox.min.css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.s?css/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [autoprefixer()],
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
}));

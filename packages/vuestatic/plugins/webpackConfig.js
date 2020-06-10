const path = require("path");
const webpack = require("webpack");

const ASSETS_FOLDER = "_assets";

const applyBaseConfig = ({ isProd, srcDir, defaultVueApp }, webpackConfig) => {
  const { VueLoaderPlugin } = require("vue-loader");
  const MiniCssExtractPlugin = require("mini-css-extract-plugin");
  const { CleanWebpackPlugin } = require("clean-webpack-plugin");

  webpackConfig.mode(isProd ? "production" : "development");

  webpackConfig.module
    .rule("compile-vue")
    .test(/\.vue$/)
    .use("vue-loader")
    .loader("vue-loader");

  webpackConfig.module
    .rule("compile-css")
    .test(/\.css$/)
    .use("vue-style-loader")
    .loader("vue-style-loader")
    .end()
    .use("mini-css-extract")
    .loader(MiniCssExtractPlugin.loader)
    .end()
    .use("css-loader")
    .loader("css-loader")
    .options({
      importLoaders: 1,
    })
    .end()
    .use("postcss-loader")
    .loader("postcss-loader")
    .end();

  webpackConfig.resolve.modules
    .add(srcDir)
    .add(defaultVueApp)
    .add("node_modules");

  webpackConfig.plugin("vue-loader").use(new VueLoaderPlugin());
  webpackConfig.plugin("mini-css-extract").use(
    new MiniCssExtractPlugin({
      filename: path.join(
        ASSETS_FOLDER,
        isProd ? "[name].[contenthash].css" : "[name].css",
      ),
    }),
  );
  webpackConfig
    .plugin("clean")
    .use(new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }));
  webpackConfig.plugin("define").use(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": isProd ? '"production"' : '"development"',
      "process.env.VUE_ENV": '"client"',
    }),
  );
};

module.exports = {
  applyBaseConfig,
};

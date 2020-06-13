import path from "path";
import webpack from "webpack";
import Config from "webpack-chain";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { VueLoaderPlugin } from "vue-loader";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

import type { NormalizedConfig } from "./Execution";

const applyBaseConfig = (
  { isProd, srcDir }: NormalizedConfig,
  webpackConfig: Config,
): void => {
  webpackConfig.mode(isProd ? "production" : "development");
  webpackConfig.module
    .rule("compile-vue")
    .test(/\.vue$/)
    .use("vue-loader")
    .loader("vue-loader");

  webpackConfig.module
    .rule("compile-css")
    .test(/\.css$/)
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

  webpackConfig.resolve.alias.set(
    "@vuestatic/app",
    path.join(srcDir, "app.js"),
  );

  webpackConfig.plugin("vue-loader").use(new VueLoaderPlugin());

  webpackConfig.plugin("mini-css-extract").use(
    new MiniCssExtractPlugin({
      filename: path.join(
        "_assets",
        isProd ? "[name].[contenthash].css" : "[name].css",
      ),
    }),
  );

  webpackConfig
    .plugin("clean")
    .use(new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }));

  webpackConfig.node.set("setImmediate", false);

  webpackConfig.plugin("define-mode").use(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": isProd ? '"production"' : '"development"',
    }),
  );
};

export = applyBaseConfig;

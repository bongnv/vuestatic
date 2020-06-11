import path from "path";
import webpack from "webpack";
import Config from "webpack-chain";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { VueLoaderPlugin } from "vue-loader";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const applyBaseConfig = (
  { isProd, srcDir }: ExecutionConfig,
  webpackConfig: Config,
) => {
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

  webpackConfig.module
    .rule("compile-ts")
    .test(/\.ts$/)
    .use("ts-loader")
    .loader("ts-loader")
    .end();

  webpackConfig.resolve.extensions.add(".ts").add(".js").end();
  webpackConfig.resolve.modules.add(srcDir).add("node_modules");

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

  webpackConfig.plugin("define").use(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": isProd ? '"production"' : '"development"',
    }),
  );
};

export = applyBaseConfig;

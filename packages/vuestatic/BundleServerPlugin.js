const ASSETS_FOLDER = "_assets";

class BundleServerPlugin {
  apply({ hooks }) {
    const pluginName = "BundleServerPlugin";

    hooks["config"].tap(pluginName, ({ config }) => {
      const path = require("path");
      const Config = require('webpack-chain');
      const MiniCssExtractPlugin = require("mini-css-extract-plugin");
      const { VueLoaderPlugin } = require("vue-loader");
      const VueServerBundlePlugin = require("@bongnv/vue-ssr-server-webpack-plugin");


      const baseDir = path.resolve(process.cwd());
      const isPrd = process.env.NODE_ENV === "production";

      const webpackConfig = new Config();
      webpackConfig
        .mode(isPrd ? "production" : "development")
        .target("node")
        .entry("app")
        .add("./src/entry-server.js")
        .end()
        .entry('static-props')
        .add('./src/static-props.js');

      webpackConfig.output
        .libraryTarget("commonjs2")
        .path(config.serverPath)
        .filename("[name].js");

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
        .rule("compile-md")
        .test(/\.md$/)
        .use("markdown-loader")
        .loader("@bongnv/markdown-loader")
        .options({
          plugins: [require("@bongnv/markdown-images-plugin")],
        });

      webpackConfig.module
        .rule("compile-images")
        .test(/\.(jpg|jpeg|png|svg|webp|gif|ico)$/)
        .use("image-trace-loader")
        .loader("image-trace-loader")
        .end()
        .use("file-loader")
        .loader("file-loader")
        .options({
          name: isPrd ? "[contenthash].[ext]" : "[name].[ext]",
          outputPath: "static/_assets/images",
          publicPath: "/_assets/images",
        })
        .end()
        .use("image-webpack-loader")
        .loader("image-webpack-loader")
        .options({
          disable: !isPrd,
        });

      webpackConfig.plugin("vue-loader").use(new VueLoaderPlugin());
      webpackConfig.plugin("vue-server-bundle").use(new VueServerBundlePlugin({
        entryName: "app.js",
      }));
      webpackConfig.plugin("mini-css-extract").use(new MiniCssExtractPlugin({
        filename: path.join(
          ASSETS_FOLDER,
          isPrd ? "[name].[contenthash].css" : "[name].css",
        ),
      }));

      config.serverWebpackConfig = webpackConfig;
    });

    hooks["build"] &&
      hooks["build"].tapPromise(pluginName, async ({ config }) => {
        const { webpackAsync } = require("./utils");

        const serverResult = await webpackAsync(config.serverWebpackConfig.toConfig());
        console.log(serverResult.toString());
      });
  }
}

module.exports = BundleServerPlugin;

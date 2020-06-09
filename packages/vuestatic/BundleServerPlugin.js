class BundleServerPlugin {
  apply({ hooks }) {
    const pluginName = "BundleServerPlugin";

    hooks["config"].tap(pluginName, ({ config }) => {
      const path = require("path");
      const Config = require("webpack-chain");
      const VueServerBundlePlugin = require("@bongnv/vue-ssr-server-webpack-plugin");

      const { applyBaseConfig } = require("./webpackConfig");
      const { isWatch, isProd } = config;

      const webpackConfig = new Config();
      applyBaseConfig(config, webpackConfig);

      webpackConfig
        .target("node")
        .entry("static-props")
        .add("./src/static-props.js")
        .end()
        .entry("server")
        .add("./src/entry-server.js")
        .end();

      webpackConfig.output
        .libraryTarget("commonjs2")
        .path(config.serverPath)
        .filename("[name].js");

      webpackConfig.module
        .rule("compile-md")
        .test(/\.md$/)
        .use("markdown-loader")
        .loader("@bongnv/markdown-loader")
        .options({
          plugins: [require("@bongnv/markdown-images-plugin")],
        });

      const imagesDir = path.join(
        isWatch ? "static" : path.relative(config.serverPath, config.outputDir),
        "_assets/images",
      );
      webpackConfig.module
        .rule("compile-images")
        .test(/\.(jpg|jpeg|png|svg|webp|gif|ico)$/)
        .use("image-trace-loader")
        .loader("image-trace-loader")
        .end()
        .use("file-loader")
        .loader("file-loader")
        .options({
          name: isProd ? "[contenthash].[ext]" : "[name].[ext]",
          outputPath: imagesDir,
          publicPath: "/_assets/images",
        })
        .end()
        .use("image-webpack-loader")
        .loader("image-webpack-loader")
        .options({
          disable: !isProd,
        });

      webpackConfig.plugin("vue-server-bundle").use(
        new VueServerBundlePlugin({
          entryName: "server",
        }),
      );

      config.serverWebpackConfig = webpackConfig;
    });

    hooks["build"] &&
      hooks["build"].tapPromise(pluginName, async ({ config }) => {
        const { webpackAsync } = require("./utils");

        const serverResult = await webpackAsync(
          config.serverWebpackConfig.toConfig(),
        );
        console.log(serverResult.toString());
      });
  }
}

module.exports = BundleServerPlugin;

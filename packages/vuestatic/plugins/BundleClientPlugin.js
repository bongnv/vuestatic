class BundleClientPlugin {
  apply({ hooks }) {
    const pluginName = "BundleClientPlugin";

    hooks["config"].tap(pluginName, ({ config }) => {
      const path = require("path");
      const Config = require("webpack-chain");
      const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");

      const { applyBaseConfig } = require("./webpackConfig");
      const { isProd } = config;

      const webpackConfig = new Config();
      applyBaseConfig(config, webpackConfig);
      webpackConfig.entry("app").add("entry-client.js");

      webpackConfig.output
        .path(config.outputDir)
        .publicPath("/")
        .filename(isProd ? "[name].[contenthash].js" : "[name].js")
        .chunkFilename(isProd ? "[name].[contenthash].js" : "[name].js");

      webpackConfig.module
        .rule("compile-js")
        .test(/\.ts$/)
        .exclude.add(/node_modules/)
        .end()
        .use("babel-loader")
        .loader("babel-loader");

      webpackConfig.module
        .rule("compile-client-plugins")
        .test(path.join(config.defaultVueApp, "applyClientPlugins.js"))
        .use("val-loader")
        .options({
          plugins: config.clientPlugins,
        })
        .loader("val-loader");

      webpackConfig.plugin("vue-ssr-client").use(new VueSSRClientPlugin());
      config.clientWebpackConfig = webpackConfig;
    });

    hooks["build"] &&
      hooks["build"].tapPromise(pluginName, async ({ config }) => {
        const { webpackAsync } = require("../utils");

        const clientResult = await webpackAsync(
          config.clientWebpackConfig.toConfig(),
        );
        console.log(clientResult.toString());
      });
  }
}

module.exports = BundleClientPlugin;
import path from "path";
import Config from "webpack-chain";
import VueSSRClientPlugin from "vue-server-renderer/client-plugin";

import applyBaseConfig from "./applyBaseConfig";
import webpackAsync from "./webpackAsync";

class BundleClientPlugin {
  apply({ hooks, config }: Execution): void {
    const pluginName = "BundleClientPlugin";

    config.coreVueApp = path.resolve(__dirname, "../vue-app");

    hooks["config"].tap(pluginName, ({ config }: Execution) => {
      const { isProd, coreVueApp } = config;

      const webpackConfig = new Config();

      applyBaseConfig(config, webpackConfig);

      webpackConfig.entry("app").add(path.join(coreVueApp, "entry-client.js"));

      webpackConfig.output
        .path(config.outputDir)
        .publicPath(config.publicPath)
        .filename(isProd ? "[name].[contenthash].js" : "[name].js")
        .chunkFilename(isProd ? "[name].[contenthash].js" : "[name].js");

      webpackConfig.module
        .rule("compile-js")
        .test(/\.js$/)
        .exclude.add(/node_modules/)
        .end()
        .use("babel-loader")
        .loader("babel-loader");

      webpackConfig.module
        .rule("compile-client-plugins")
        .test(path.join(config.coreVueApp, "applyClientPlugins.js"))
        .use("val-loader")
        .loader("val-loader")
        .options({
          plugins: config.clientPlugins,
        });

      webpackConfig.plugin("vue-ssr-client").use(new VueSSRClientPlugin());

      config.clientWebpackConfig = webpackConfig;

      config.clientPlugins.push(
        path.join(config.coreVueApp, "client-plugin.js"),
      );
    });

    hooks["build"] &&
      hooks["build"].tapPromise(pluginName, async ({ config }: Execution) => {
        const clientResult = await webpackAsync(
          config.clientWebpackConfig.toConfig(),
        );
        console.log(clientResult.toString());
      });
  }
}

export = BundleClientPlugin;

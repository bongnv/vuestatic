import path from "path";
import Config from "webpack-chain";
import type { Hook } from "tapable";
import VueSSRClientPlugin from "vue-server-renderer/client-plugin";
import { Execution } from "./Execution";

import applyBaseConfig from "./applyBaseConfig";
import webpackAsync from "./webpackAsync";

const PLUGIN_NAME = "BundleClientPlugin";

export class BundleClientPlugin {
  setupExecute(executeHook: Hook) {
    executeHook.tapPromise(PLUGIN_NAME, async ({ config }: Execution) => {
      const clientResult = await webpackAsync(
        config.clientWebpackConfig.toConfig(),
      );
      console.log(clientResult.toString());
    });
  }

  setupConfig(configHook: Hook) {
    configHook.tap(PLUGIN_NAME, ({ config }: Execution) => {
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
  }

  apply({ commands, steps }: Execution): void {
    this.setupConfig(steps.for("config"));

    commands.for("build").tapPromise(PLUGIN_NAME, async ({ steps }: Execution) => {
      this.setupExecute(steps.for("execute"));
    });

    commands.for("analyze").tapPromise(PLUGIN_NAME, async ({ steps }: Execution) => {
      this.setupExecute(steps.for("execute"));
    });
  }
}

import path from "path";
import webpack from "webpack";
import type { Hook } from "tapable";
import VueSSRClientPlugin from "vue-server-renderer/client-plugin";
import { Execution } from "./Execution";

import applyBaseConfig from "./applyBaseConfig";
import webpackAsync from "./webpackAsync";

const PLUGIN_NAME = "BundleClientPlugin";

export class BundleClientPlugin {
  setupExecute(executeHook: Hook): void {
    executeHook.tapPromise(PLUGIN_NAME, async ({ config }: Execution) => {
      const clientResult = await webpackAsync(
        config.clientWebpackConfig.toConfig(),
      );
      console.log(clientResult.toString());
    });
  }

  setupConfig(configHook: Hook): void {
    configHook.tap(PLUGIN_NAME, ({ config }: Execution) => {
      const { isProd } = config;
      const coreVueApp = path.resolve(__dirname, "../vue-app");

      const webpackConfig = config.clientWebpackConfig;

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
        .test(path.join(coreVueApp, "applyClientPlugins.js"))
        .use("val-loader")
        .loader("val-loader")
        .options({
          plugins: config.clientPlugins,
        });

      webpackConfig.resolve.alias.set(
        "@vuestatic/applyClientPlugins",
        path.join(coreVueApp, "applyClientPlugins.js"),
      );

      webpackConfig.resolve.alias.set(
        "@vuestatic/static-props",
        path.join(coreVueApp, "static-props-client.js"),
      );

      webpackConfig.plugin("vue-ssr-client").use(new VueSSRClientPlugin());

      webpackConfig.plugin("define-vue").use(
        new webpack.DefinePlugin({
          "process.env.VUE_ENV": '"client"',
        }),
      );

      config.clientWebpackConfig = webpackConfig;

      config.clientPlugins.push(path.join(coreVueApp, "client-plugin.js"));
    });
  }

  apply({ commands, steps }: Execution): void {
    this.setupConfig(steps.for("config"));

    commands
      .for("build")
      .tapPromise(PLUGIN_NAME, async ({ steps }: Execution) => {
        this.setupExecute(steps.for("execute"));
      });

    commands
      .for("analyze")
      .tapPromise(PLUGIN_NAME, async ({ steps }: Execution) => {
        this.setupExecute(steps.for("execute"));
      });
  }
}

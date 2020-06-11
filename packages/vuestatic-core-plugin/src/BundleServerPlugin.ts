import path from "path";
import VueServerBundlePlugin from "@bongnv/vue-ssr-server-webpack-plugin";
import Config from "webpack-chain";

import applyBaseConfig from "./applyBaseConfig";
import webpackAsync from "./webpackAsync";

class BundleServerPlugin {
  apply({ hooks }: Execution) {
    const pluginName = "BundleServerPlugin";

    hooks["config"].tap(pluginName, ({ config }: Execution) => {
      const webpackConfig = new Config();

      applyBaseConfig(config, webpackConfig);

      webpackConfig
        .target("node")
        .entry("static-props")
        .add("static-props.js")
        .end()
        .entry("app")
        .add(path.join(config.coreVueApp, "entry-server.ts"))
        .end();

      webpackConfig.output
        .libraryTarget("commonjs2")
        .path(config.serverPath)
        .filename("[name].js");

      webpackConfig.plugin("vue-server-bundle").use(
        new VueServerBundlePlugin({
          entryName: "app",
        }),
      );

      config.serverWebpackConfig = webpackConfig;
    });

    hooks["build"] &&
      hooks["build"].tapPromise(pluginName, async ({ config }: Execution) => {
        const serverResult = await webpackAsync(
          config.serverWebpackConfig.toConfig(),
        );
        console.log(serverResult.toString());
      });
  }
}

export = BundleServerPlugin;

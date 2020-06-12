import path from "path";
import VueServerBundlePlugin from "@bongnv/vue-ssr-server-webpack-plugin";
import Config from "webpack-chain";

import applyBaseConfig from "./applyBaseConfig";
import webpackAsync from "./webpackAsync";
import { Execution, ExecutionConfig } from "./Execution";

export class BundleServerPlugin {
  injectWebpackConfig(config: ExecutionConfig): void {
    const webpackConfig = new Config();

    applyBaseConfig(config, webpackConfig);

    webpackConfig
      .target("node")
      .entry("static-props")
      .add("@vuestatic/static-props")
      .end()
      .entry("app")
      .add(path.join(config.coreVueApp, "entry-server.js"))
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

    webpackConfig.optimization.minimize(false);

    config.serverWebpackConfig = webpackConfig;
  }

  apply({ commands }: Execution): void {
    const pluginName = "BundleServerPlugin";

    commands.for("build").tap(pluginName, ({ steps }: Execution) => {
      steps.for("config").tap(pluginName, ({ config }: Execution) => {
        this.injectWebpackConfig(config);
      });

      steps
        .for("execute")
        .tapPromise(pluginName, async ({ config }: Execution) => {
          const serverResult = await webpackAsync(
            config.serverWebpackConfig.toConfig(),
          );
          console.log(serverResult.toString());
        });
    });

    commands.for("dev").tap(pluginName, ({ steps }: Execution) => {
      steps.for("config").tap(pluginName, ({ config }: Execution) => {
        this.injectWebpackConfig(config);
      });
    });
  }
}

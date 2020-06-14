import path from "path";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import VueServerBundlePlugin from "@bongnv/vue-ssr-server-webpack-plugin";

import applyBaseConfig from "./applyBaseConfig";
import webpackAsync from "./webpackAsync";
import { Execution, NormalizedConfig } from "./Execution";

export class BundleServerPlugin {
  injectWebpackConfig(config: NormalizedConfig): void {
    const webpackConfig = config.serverWebpackConfig;
    const coreVueApp = path.resolve(__dirname, "../vue-app");

    applyBaseConfig(config, webpackConfig);

    webpackConfig
      .target("node")
      .entry("static-props")
      .add("@vuestatic/static-props")
      .end()
      .entry("app")
      .add(path.join(coreVueApp, "entry-server.js"))
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
    webpackConfig.externals(
      nodeExternals({
        // do not externalize CSS files in case we need to import it from a dep
        whitelist: /\.css$/,
      }),
    );

    webpackConfig.plugin("define-vue").use(
      new webpack.DefinePlugin({
        "process.env.VUE_ENV": '"server"',
      }),
    );

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

class BundleServerPlugin {
  apply({ hooks }) {
    const pluginName = "BundleServerPlugin";

    hooks["config"].tap(pluginName, ({ config }) => {
      const Config = require("webpack-chain");
      const VueServerBundlePlugin = require("@bongnv/vue-ssr-server-webpack-plugin");

      const { applyBaseConfig } = require("./webpackConfig");

      const webpackConfig = new Config();
      applyBaseConfig(config, webpackConfig);

      webpackConfig
        .target("node")
        .entry("static-props")
        .add("static-props.js")
        .end()
        .entry("app")
        .add("entry-server.js")
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
      hooks["build"].tapPromise(pluginName, async ({ config }) => {
        const { webpackAsync } = require("../utils");

        const serverResult = await webpackAsync(
          config.serverWebpackConfig.toConfig(),
        );
        console.log(serverResult.toString());
      });
  }
}

module.exports = BundleServerPlugin;
